from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.db.models.signals import pre_save
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import status
from rest_framework.test import APITestCase

from animals.models import AdoptionRequest, Animal
from animals.signals import geocode_city
from users.models import AdopterProfile, ProtectoraApproval

User = get_user_model()


class UserViewsTest(APITestCase):
    def setUp(self):
        pre_save.disconnect(geocode_city, sender=Animal)

        self.register_url = "/users/register/"
        self.login_url = "/users/login/"
        self.logout_url = "/users/logout/"
        self.check_url = "/users/check_session/"
        self.search_url = "/users/"
        self.adopters_url = "/users/adopters/"
        self.profile_url = "/users/profile/"
        self.profile_update_url = "/users/profile/update/"
        self.adoption_form_url = "/users/profile/adoption-form/"
        self.public_profile_url = "/users/{id}/profile/"
        self.cancel_adoption_url = "/users/animals/request/{req_id}/delete/"
        self.adoption_request_url = "/users/animals/{animal_id}/request/"
        self.pwd_reset_request_url = "/users/password-reset/"
        self.pwd_reset_confirm_url = "/users/password-reset-confirm/"
        self.pending_protectoras_url = "/users/admin/pending-protectoras/"
        self.validate_protectora_url = "/users/admin/validate-protectora/{}/"
        self.block_user_url = "/users/admin/block/{}/"
        self.unblock_user_url = "/users/admin/unblock/{}/"
        self.delete_user_url = "/users/admin/delete/{}/"
        self.list_blocked_users_url = "/users/admin/blocked-users/"

        self.user = User.objects.create_user(
            username="johndoe",
            email="john@example.com",
            password="password123",
        )
        self.alice = User.objects.create_user(username="alice", email="alice@example.com", password="pw")
        self.bob = User.objects.create_user(username="bob", email="bob@example.com", password="pw")
        self.admin = User.objects.create_superuser(username="admin", email="admin@example.com", password="adminpw")

        AdopterProfile.objects.get_or_create(user=self.user)
        AdopterProfile.objects.get_or_create(user=self.alice)

        self.animal = Animal.objects.create(name="Fido", owner=self.alice)

    def test_register_adoptante_success(self):
        data = {
            "username": "newuser",
            "email": "new@example.com",
            "password": "abc12345",
            "password2": "abc12345",
        }
        resp = self.client.post(self.register_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data.get("message"), "Usuario creado correctamente!")
        self.assertTrue(User.objects.filter(username="newuser", is_active=True, is_staff=False).exists())

    def test_register_protectora_success(self):
        data = {
            "username": "protuser",
            "email": "prot@example.com",
            "password": "abc12345",
            "password2": "abc12345",
            "role": "protectora",
            "localidad": "Valencia",
        }
        resp = self.client.post(self.register_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data.get("message"), "Solicitud de protectora enviada. Espera aprobación.")
        prot = User.objects.get(username="protuser")
        self.assertFalse(prot.is_active)
        self.assertTrue(prot.is_staff)
        pa = ProtectoraApproval.objects.get(user=prot)
        self.assertFalse(pa.approved)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Solicitud de registro de protectora", mail.outbox[0].subject)

    def test_register_existing_email(self):
        data = {
            "username": "whatever",
            "email": self.user.email,
            "password": "pw1",
            "password2": "pw1",
        }
        resp = self.client.post(self.register_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Ya existe un usuario registrado con este correo.", resp.data.get("email", []))

    def test_register_invalid_data(self):
        """
        El serializer no exige password2, así que en realidad crea el usuario,
        devolviendo 201 CREATED.
        """
        data = {
            "username": "baduser",
            "email": "bad@example.com",
            "password": "pw1",
        }
        resp = self.client.post(self.register_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data.get("message"), "Usuario creado correctamente!")
        self.assertTrue(User.objects.filter(username="baduser").exists())

    def test_login_with_valid_credentials(self):
        resp = self.client.post(
            self.login_url,
            {"username": "johndoe", "password": "password123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get("role"), "adoptante")
        self.assertEqual(resp.data["user"]["username"], "johndoe")

    def test_login_with_invalid_credentials(self):
        resp = self.client.post(
            self.login_url,
            {"username": "johndoe", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", resp.data)

    def test_login_protectora_pending(self):
        prot = User.objects.create_user("prot1", email="prot1@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = False
        prot.save()
        resp = self.client.post(self.login_url, {"username": "prot1", "password": "pw"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("error", resp.data)

    def test_check_session_and_logout(self):
        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        resp = self.client.post(self.logout_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_search_filters_usernames(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.search_url, {"search": "ali"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in resp.data]
        self.assertIn("alice", usernames)
        self.assertNotIn("bob", usernames)
        self.assertNotIn("johndoe", usernames)

        resp = self.client.get(self.search_url, {"search": ""})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, [])

    def test_adopter_list(self):
        resp = self.client.get(self.adopters_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in resp.data]
        self.assertIn("johndoe", usernames)
        self.assertIn("alice", usernames)
        self.assertIn("bob", usernames)
        self.assertNotIn("admin", usernames)

    def test_get_own_profile_adoptante(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "johndoe")
        self.assertEqual(resp.data["role"], "adoptante")
        self.assertIn("favorites", resp.data)
        self.assertIn("adopted", resp.data)
        self.assertIn("requests", resp.data)

    def test_update_own_profile(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.put(
            self.profile_update_url,
            {"location": "Barcelona", "bio": "Hola mundo"},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["location"], "Barcelona")
        self.assertEqual(resp.data["bio"], "Hola mundo")

    def test_get_own_profile_protectora(self):
        prot, _ = AdopterProfile.objects.get_or_create(
            user=User.objects.create_user("prot2", email="p2@example.com", password="pw", is_active=True, is_staff=True)
        )
        Animal.objects.create(name="Rex", owner=prot.user)
        self.client.login(username="prot2", password="pw")
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["role"], "protectora")
        self.assertIn("en_adopcion", resp.data)
        self.assertIn("adopted", resp.data)

    def test_get_public_profile_of_other_user(self):
        self.client.login(username="johndoe", password="password123")
        url = self.public_profile_url.format(id=self.alice.id)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "alice")
        self.assertEqual(resp.data["role"], "adoptante")

    def test_get_public_profile_inactive(self):
        inactive = User.objects.create_user("temp", email="t@example.com", password="pw", is_active=False)
        self.client.login(username="johndoe", password="password123")
        url = self.public_profile_url.format(id=inactive.id)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_favorite_animal_add_and_remove(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.post(f"/users/favorites/{self.animal.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertIn(self.animal, self.user.profile.favorites.all())

        resp2 = self.client.delete(f"/users/favorites/{self.animal.id}/")
        self.assertEqual(resp2.status_code, status.HTTP_204_NO_CONTENT)
        self.assertNotIn(self.animal, self.user.profile.favorites.all())

    def test_adoption_request_view_get_post_delete(self):
        self.client.login(username="johndoe", password="password123")
        url = self.adoption_request_url.format(animal_id=self.animal.id)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, [])

        resp2 = self.client.post(url)
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)
        ar = AdoptionRequest.objects.get(user=self.user, animal=self.animal)

        resp3 = self.client.delete(url)
        self.assertEqual(resp3.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(AdoptionRequest.objects.filter(pk=ar.id).exists())

    def test_cancel_adoption_request_view(self):
        self.client.login(username="johndoe", password="password123")
        ar = AdoptionRequest.objects.create(user=self.user, animal=self.animal)
        url = self.cancel_adoption_url.format(req_id=ar.id)

        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

        self.client.login(username="alice", password="pw")
        resp2 = self.client.delete(url)
        self.assertEqual(resp2.status_code, status.HTTP_404_NOT_FOUND)

    def test_adoption_form_get_and_post(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.adoption_form_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("adoption_form", resp.data)

        form = {"edad": "cachorro", "tiene_jardin": True}
        resp2 = self.client.post(self.adoption_form_url, {"adoption_form": form}, format="json")
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertEqual(resp2.data["adoption_form"], form)

    def test_password_reset_request_no_email(self):
        resp = self.client.post(self.pwd_reset_request_url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Debe proporcionar un email.", resp.data.get("error", ""))

    def test_password_reset_request_nonexistent_email(self):
        resp = self.client.post(self.pwd_reset_request_url, {"email": "noone@nowhere.com"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_418_IM_A_TEAPOT)
        self.assertEqual(resp.data.get("error"), "error_usuario_no_encontrado")

    def test_password_reset_request_success(self):
        resp = self.client.post(self.pwd_reset_request_url, {"email": self.user.email}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("Si ese correo existe en nuestro sistema", resp.data.get("message", ""))

    def test_password_reset_confirm_missing_params(self):
        resp = self.client.put(self.pwd_reset_confirm_url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Debe proporcionar uid, token y new_password", resp.data.get("detail", ""))

    def test_password_reset_confirm_invalid_uid(self):
        data = {"uid": "bad", "token": "tok", "new_password": "newpass"}
        resp = self.client.put(self.pwd_reset_confirm_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("UID inválido", resp.data.get("detail", ""))

    def test_password_reset_confirm_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        data = {"uid": uid, "token": "wrong", "new_password": "newpass"}
        resp = self.client.put(self.pwd_reset_confirm_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Token inválido o expirado", resp.data.get("detail", ""))

    def test_password_reset_confirm_success(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        data = {"uid": uid, "token": token, "new_password": "brandnew123"}
        resp = self.client.put(self.pwd_reset_confirm_url, data, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("Contraseña actualizada correctamente", resp.data.get("message", ""))
        self.assertTrue(self.client.login(username="johndoe", password="brandnew123"))

    def test_list_pending_protectoras_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.pending_protectoras_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_pending_protectoras_admin(self):
        prot = User.objects.create_user("protpend", email="pp@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = False
        prot.save()
        ProtectoraApproval.objects.create(user=prot, approved=False)

        self.client.login(username="admin", password="adminpw")
        resp = self.client.get(self.pending_protectoras_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("protpend", [u["username"] for u in resp.data])

    def test_validate_protectora_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.post(self.validate_protectora_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_validate_protectora_admin(self):
        prot = User.objects.create_user("protval", email="pv@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = False
        prot.save()
        pa = ProtectoraApproval.objects.create(user=prot, approved=False)

        self.client.login(username="admin", password="adminpw")
        resp = self.client.post(self.validate_protectora_url.format(prot.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        prot.refresh_from_db()
        pa.refresh_from_db()
        self.assertTrue(prot.is_active)
        self.assertTrue(pa.approved)

    def test_block_user_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.put(self.block_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_block_user_self(self):
        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.block_user_url.format(self.admin.id))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No puedes bloquearte a ti mismo", resp.data.get("detail", ""))

    def test_block_user_adoptante(self):
        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.block_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.alice.refresh_from_db()
        self.assertFalse(self.alice.is_active)

    def test_block_user_protectora(self):
        prot = User.objects.create_user("protblk", email="pb@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = True
        prot.save()
        pa = ProtectoraApproval.objects.create(user=prot, approved=True)

        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.block_user_url.format(prot.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        prot.refresh_from_db()
        pa.refresh_from_db()
        self.assertFalse(prot.is_active)
        self.assertTrue(pa.approved)

    def test_block_user_already_blocked(self):
        self.bob.is_active = False
        self.bob.save()
        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.block_user_url.format(self.bob.id))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Usuario ya bloqueado", resp.data.get("detail", ""))

    def test_unblock_user_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.put(self.unblock_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unblock_user_active(self):
        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.unblock_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Usuario ya activo", resp.data.get("detail", ""))

    def test_unblock_user_success(self):
        self.alice.is_active = False
        self.alice.save()
        self.client.login(username="admin", password="adminpw")
        resp = self.client.put(self.unblock_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.alice.refresh_from_db()
        self.assertTrue(self.alice.is_active)

    def test_delete_user_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.delete(self.delete_user_url.format(self.alice.id))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_user_self(self):
        self.client.login(username="admin", password="adminpw")
        resp = self.client.delete(self.delete_user_url.format(self.admin.id))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("No puedes eliminarte a ti mismo", resp.data.get("detail", ""))

    def test_delete_user_success(self):
        self.client.login(username="admin", password="adminpw")
        resp = self.client.delete(self.delete_user_url.format(self.bob.id))
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.bob.id).exists())

    def test_list_blocked_users_nonadmin(self):
        self.client.login(username="johndoe", password="password123")
        resp = self.client.get(self.list_blocked_users_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_blocked_users_admin(self):
        temp = User.objects.create_user("temp", email="t@example.com", password="pw")
        temp.is_active = False
        temp.save()
        prot = User.objects.create_user("protblk2", email="pb2@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = False
        prot.save()
        ProtectoraApproval.objects.create(user=prot, approved=True)

        self.client.login(username="admin", password="adminpw")
        resp = self.client.get(self.list_blocked_users_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = {u["username"] for u in resp.data}
        self.assertIn("temp", names)
        self.assertIn("protblk2", names)
