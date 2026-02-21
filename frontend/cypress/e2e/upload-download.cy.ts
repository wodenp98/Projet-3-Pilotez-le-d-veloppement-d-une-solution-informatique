describe("File upload and download", () => {
  const email = `upload-${Date.now()}@test.com`;
  const password = "password123";

  before(() => {
    cy.request("POST", "http://localhost:8080/api/auth/register", {
      email,
      password,
    }).then((res) => {
      window.localStorage.setItem("token", res.body.token);
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem("token");
      if (!token) {
        cy.request("POST", "http://localhost:8080/api/auth/login", {
          email,
          password,
        }).then((res) => {
          win.localStorage.setItem("token", res.body.token);
        });
      }
    });
  });

  it("allows uploading a file from the dashboard", () => {
    cy.visit("/dashboard");

    cy.contains("Ajouter des fichiers").click();

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("test content"),
        fileName: "test-document.txt",
        mimeType: "text/plain",
      },
      { force: true },
    );

    cy.contains("test-document.txt").should("be.visible");

    cy.contains("Téleverser").click();

    cy.contains("Copier le lien").should("be.visible");
  });

  it("allows seeing the file in the history", () => {
    cy.visit("/dashboard");

    cy.contains("test-document.txt").should("be.visible");
  });
});
