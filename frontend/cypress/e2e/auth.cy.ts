describe("Authentication", () => {
  const email = `test-${Date.now()}@test.com`;
  const password = "password123";

  it("allows creating an account and redirects to the dashboard", () => {
    cy.visit("/register");

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type(password);
    cy.get('input[type="password"]').last().type(password);

    cy.contains("button", "Créer mon compte").click();

    cy.url().should("include", "/dashboard");
    cy.window()
      .then((win) => win.localStorage.getItem("token"))
      .should("not.be.null");
  });

  it("allows logging in with an existing account", () => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);

    cy.contains("button", "Connexion").click();

    cy.url().should("include", "/dashboard");
  });

  it("displays an error with a wrong password", () => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type("wrong-password");

    cy.contains("button", "Connexion").click();

    cy.contains("Invalid credentials").should("be.visible");
  });
});
