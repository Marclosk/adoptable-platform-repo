# users/views.py

from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages

# Vista de registro de usuario
def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Cuenta creada exitosamente!")
            return redirect('home')  # Redirige a la página principal
        else:
            messages.error(request, "Error al crear la cuenta. Verifica los datos.")
    else:
        form = UserCreationForm()
    return render(request, "registration/register.html", {"form": form})

# Vista de login de usuario
def user_login(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, "Has iniciado sesión correctamente!")
                return redirect('home')
            else:
                messages.error(request, "Usuario o contraseña incorrectos.")
        else:
            messages.error(request, "Formulario inválido.")
    else:
        form = AuthenticationForm()
    return render(request, "registration/login.html", {"form": form})
