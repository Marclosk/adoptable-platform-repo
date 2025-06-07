"use strict";
describe("Login Page", () => {
    beforeEach(() => {
        // Visitar la página de login antes de cada prueba
        cy.visit("http://localhost:3000/");
    });
    it("should display validation error when both fields are empty", () => {
        // Intentar iniciar sesión con campos vacíos
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que el mensaje de error correcto se muestre
        cy.contains("Los campos están vacíos").should("be.visible");
    });
    it("should display validation error when username field is empty", () => {
        // Introducir solo contraseña
        cy.get("input[type='password']").type("Valid123");
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que el mensaje de error correcto se muestre
        cy.contains("El campo nombre de usuario está vacío").should("be.visible");
    });
    it("should display validation error when password field is empty", () => {
        // Introducir solo nombre de usuario
        cy.get("input[type='username']").type("validUser");
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que el mensaje de error correcto se muestre
        cy.contains("El campo contraseña está vacío").should("be.visible");
    });
    it("should display validation error for invalid password format", () => {
        // Introducir datos con contraseña inválida
        cy.get("input[type='username']").type("validUser");
        cy.get("input[type='password']").type("123");
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que el mensaje de error correcto se muestre
        cy.contains("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.").should("be.visible");
    });
    it("should login successfully with valid credentials", () => {
        // Interceptar la solicitud de login con la URL correcta
        cy.intercept("POST", "http://localhost:8000/users/login/", {
            statusCode: 200,
            body: { success: true, token: "fakeToken" },
        }).as("loginRequest");
        // Introducir datos válidos
        cy.get("input[type='username']").type("marc2");
        cy.get("input[type='password']").type("Barcelona1234");
        // Hacer clic en el botón de inicio de sesión
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que la solicitud se haya realizado
        cy.wait("@loginRequest");
        // Comprobar que se redirige al dashboard
        cy.url().should("include", "/dashboard");
    });
    it("should display an error message on failed login", () => {
        // Interceptar la solicitud de login con un error
        cy.intercept("POST", "http://localhost:8000/users/login/", {
            statusCode: 401,
            body: { error: "Invalid credentials" },
        }).as("loginRequest");
        // Introducir datos inválidos
        cy.get("input[type='username']").type("invalidUser");
        cy.get("input[type='password']").type("Invalid123");
        // Hacer clic en el botón de inicio de sesión
        cy.get("button").contains("Iniciar sesión").click();
        // Verificar que la solicitud se haya realizado
        cy.wait("@loginRequest");
        // Comprobar que se muestra un mensaje de error
        cy.contains("Credenciales invalidas.").should("be.visible");
    });
    it("should navigate to the register page when clicking 'Regístrate aquí'", () => {
        // Hacer clic en el botón "Regístrate aquí"
        cy.contains("Regístrate aquí").click();
        // Verificar que la URL cambió a la página de registro
        cy.url().should("include", "/register");
    });
});
