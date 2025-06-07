"use strict";
describe("Register Page", () => {
    beforeEach(() => {
        // Visitar la página de registro antes de cada prueba
        cy.visit("http://localhost:3000/register");
    });
    it("should register successfully with valid credentials", () => {
        // Mockear la respuesta del registro para evitar hacer una llamada real a la API
        cy.intercept("POST", "http://localhost:8000/users/register", {
            statusCode: 200,
            body: { user: { username: "newUser", email: "newUser@example.com" } },
        }).as("registerRequest");
        // Llenar el formulario de registro
        cy.get("input[type='username']").type("newUser");
        cy.get("input[type='email']").type("newUser@example.com");
        cy.get("input[type='password']").type("Password123");
        cy.get("input[type='confirm_password']").type("Password123");
        cy.get("input[type='name']").type("New");
        cy.get("input[type='last_name']").type("User");
        // Hacer clic en el botón de registro
        cy.get("button").contains("Registrarse").click();
        // Esperar la respuesta del registro
        cy.wait("@registerRequest");
        // Verificar que se redirige a la página de login
        cy.url().should("include", "/login");
    });
    it("should show error message for invalid email", () => {
        // Ingresar un email inválido
        cy.get("input[type='email']").type("invalidEmail");
        // Ingresar otros datos válidos
        cy.get("input[type='password']").type("Password123");
        cy.get("input[type='confirm_password']").type("Password123");
        // Hacer clic en el botón de registro
        cy.get("button").contains("Registrarse").click();
        cy.wait(1000);
        // Verificar que se muestra el mensaje de error
        cy.contains("Por favor, ingresa un correo válido.");
    });
    it("should show error message for invalid password", () => {
        // Ingresar una contraseña inválida
        cy.get("input[type='password']").type("short");
        // Ingresar un email válido
        cy.get("input[type='email']").type("newUser@example.com");
        // Hacer clic en el botón de registro
        cy.get("button").contains("Registrarse").click();
        // Verificar que se muestra el mensaje de error
        cy.contains("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
    });
    it("should show error message for mismatched passwords", () => {
        // Ingresar contraseñas que no coinciden
        cy.get("input[type='password']").type("Password123");
        cy.get("input[type='confirm_password']").type("Password124");
        // Ingresar un email válido
        cy.get("input[type='email']").type("newUser@example.com");
        // Hacer clic en el botón de registro
        cy.get("button").contains("Registrarse").click();
        // Verificar que se muestra el mensaje de error
        cy.contains("Las contraseñas no coinciden.");
    });
    it("should redirect to login page after successful registration", () => {
        // Mockear la respuesta del registro para evitar hacer una llamada real a la API
        cy.intercept("POST", "http://localhost:8000/users/register", {
            statusCode: 200,
            body: { user: { username: "newUser", email: "newUser@example.com" } },
        }).as("registerRequest");
        // Llenar el formulario de registro
        cy.get("input[type='username']").type("newUser");
        cy.get("input[type='email']").type("newUser@example.com");
        cy.get("input[type='password']").type("Password123");
        cy.get("input[type='confirm_password']").type("Password123");
        cy.get("input[type='name']").type("New");
        cy.get("input[type='last_name']").type("User");
        // Hacer clic en el botón de registro
        cy.get("button").contains("Registrarse").click();
        // Esperar la respuesta del registro
        cy.wait("@registerRequest");
        // Verificar que se redirige a la página de login
        cy.url().should("include", "/login");
    });
});
