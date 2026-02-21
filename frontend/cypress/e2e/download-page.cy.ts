describe("Download page", () => {
  let fileToken: string;
  const email = `download-${Date.now()}@test.com`;
  const password = "password123";

  before(() => {
    cy.request("POST", "http://localhost:8080/api/auth/register", {
      email,
      password,
    })
      .its("body.token")
      .then((token) => {
        cy.visit("/");
        cy.window().then((win) => {
          const formData = new win.FormData();
          formData.append(
            "file",
            new win.Blob(["test content"], { type: "text/plain" }),
            "download-test.txt",
          );
          formData.append("expirationDays", "7");

          return win
            .fetch("http://localhost:8080/api/files", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
            .then((r) => r.json())
            .then((data) => {
              fileToken = data.token;
            });
        });
      });
  });

  it("displays file information", () => {
    cy.visit(`/download/${fileToken}`);

    cy.contains("download-test.txt").should("be.visible");
    cy.contains("Télécharger").should("be.visible");
  });

  it("displays an error for an invalid token", () => {
    cy.visit("/download/non-existent-token");

    cy.contains("Ce lien n'existe pas ou a expiré").should("be.visible");
  });
});
