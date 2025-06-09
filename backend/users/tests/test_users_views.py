from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserViewsTest(APITestCase):
    def setUp(self):
        self.login_url = "/users/login/"
        self.logout_url = "/users/logout/"
        self.check_url = "/users/check_session/"
        self.search_url = "/users/"  
        self.profile_url = "/users/profile/"  
        self.profile_update_url = "/users/profile/update/"  
        self.public_profile_url = "/users/{id}/profile/"  

        self.username = "johndoe"
        self.password = "password123"
        self.user = User.objects.create_user(username=self.username, email="john@example.com", password=self.password)

        self.alice = User.objects.create_user(username="alice", email="alice@example.com", password="pw")
        self.bob = User.objects.create_user(username="bob", email="bob@example.com", password="pw")

    def test_login_with_valid_credentials(self):
        resp = self.client.post(
            self.login_url,
            {"username": self.username, "password": self.password},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("message", resp.data)
        self.assertEqual(resp.data.get("role"), "adoptante")
        self.assertIn("user", resp.data)
        self.assertEqual(resp.data["user"]["username"], self.username)

    def test_login_with_invalid_credentials(self):
        resp = self.client.post(
            self.login_url,
            {"username": self.username, "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", resp.data)

    def test_check_session_before_and_after_login_logout(self):
        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.login(username=self.username, password=self.password)
        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        resp = self.client.post(self.logout_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        resp = self.client.get(self.check_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_search_filters_usernames(self):
        self.client.login(username=self.username, password=self.password)
        resp = self.client.get(self.search_url, {"search": "ali"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        usernames = [u["username"] for u in resp.data]
        self.assertIn("alice", usernames)
        self.assertNotIn("bob", usernames)
        self.assertNotIn(self.username, usernames)

        resp = self.client.get(self.search_url, {"search": ""})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, [])

    def test_get_own_profile(self):
        self.client.login(username=self.username, password=self.password)
        resp = self.client.get(self.profile_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], self.username)
        self.assertEqual(resp.data["role"], "adoptante")
        self.assertIn("favorites", resp.data)
        self.assertIn("adopted", resp.data)
        self.assertIn("requests", resp.data)

    def test_update_own_profile(self):
        self.client.login(username=self.username, password=self.password)
        resp = self.client.put(
            self.profile_update_url,
            {"location": "Barcelona", "bio": "Hola mundo"},
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data.get("location"), "Barcelona")
        self.assertEqual(resp.data.get("bio"), "Hola mundo")

    def test_get_public_profile_of_other_user(self):
        self.client.login(username=self.username, password=self.password)
        url = self.public_profile_url.format(id=self.alice.id)
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "alice")
        self.assertEqual(resp.data["role"], "adoptante") 

    def test_protectora_login_and_profile(self):
        prot = User.objects.create_user(username="prot1", email="prot1@example.com", password="pw")
        prot.is_staff = True
        prot.is_active = False
        prot.save()
        resp = self.client.post(self.login_url, {"username": "prot1", "password": "pw"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("error", resp.data)
