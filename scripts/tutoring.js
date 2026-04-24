(function () {
    const config = {
        bookingUrl: "https://cal.com/khaled-attia-xcyfh1/15min",
        contactEmail: "khaled.3ttia@gmail.com",
        formEndpoint: "https://formspree.io/f/xvzdvlzp"
    };

    const serviceCards = document.querySelectorAll(".service-card");
    const form = document.getElementById("intake-form");
    const summaryPanel = document.getElementById("summary-panel");
    const intakeLayout = document.querySelector(".intake-layout");
    let suppressResetSummary = false;

    if (!form || !summaryPanel || !intakeLayout) {
        return;
    }

    serviceCards.forEach((card) => {
        const button = card.querySelector(".service-select");
        if (!button) {
            return;
        }

        button.addEventListener("click", function () {
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    form.addEventListener("reset", function () {
        if (suppressResetSummary) {
            suppressResetSummary = false;
            return;
        }

        form.classList.remove("is-hidden");
        intakeLayout.classList.remove("is-success");

        window.setTimeout(() => {
            summaryPanel.innerHTML = [
                '<p class="summary-eyebrow">Booking summary</p>',
                "<h3>Fill out the form to generate your next steps.</h3>",
                '<p class="summary-text">After submission, this panel will show a clean summary and a button that sends students to book the free intro call.</p>',
                '<div class="booking-placeholder">',
                '<p class="booking-label">Intro call booking</p>',
                '<p>Students will be sent to your Cal.com intro call link after they submit the form.</p>',
                "</div>"
            ].join("");
        }, 0);
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const payload = {
            name: (formData.get("name") || "").toString().trim(),
            email: (formData.get("email") || "").toString().trim(),
            description: (formData.get("description") || "").toString().trim()
        };
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : "";

        const mailtoSubject = encodeURIComponent("Tutoring intake - " + payload.name);
        const mailtoBody = encodeURIComponent(
            [
                "Tutoring intake summary",
                "",
                "Name: " + payload.name,
                "Email: " + payload.email,
                "",
                "What they need help with:",
                payload.description
            ].join("\n")
        );

        const bookingButton =
            '<a class="button button-primary" href="' + config.bookingUrl + '" target="_blank" rel="noopener noreferrer">Book the free intro call</a>';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const response = await window.fetch(config.formEndpoint, {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Form submission failed.");
            }

            summaryPanel.innerHTML = [
                '<p class="summary-eyebrow">Booking summary</p>',
                "<h3>Your intake was submitted successfully.</h3>",
                '<p class="summary-text">Next step: book the free 15 minute intro call. Calls should be scheduled at least 24 hours in advance.</p>',
                '<div class="summary-block">',
                "<h4>What you submitted</h4>",
                '<div class="summary-list">',
                buildRow("Student", payload.name),
                buildRow("Email", payload.email),
                buildRow("What they need help with", payload.description),
                "</div>",
                "</div>",
                '<div class="summary-block">',
                "<h4>What happens after the intro call</h4>",
                "<p>If a longer session makes sense, Khaled will follow up directly with the recommended format, timing, and any logistics.</p>",
                "</div>",
                '<div class="summary-block">',
                "<h4>Next actions</h4>",
                '<div class="form-actions">',
                bookingButton,
                "</div>",
                "</div>"
            ].join("");

            form.classList.add("is-hidden");
            intakeLayout.classList.add("is-success");
            suppressResetSummary = true;
            form.reset();

            try {
                window.localStorage.setItem("tutoringIntakeDraft", JSON.stringify(payload));
            } catch (error) {
                // Ignore localStorage errors in privacy-restricted browsers.
            }

            summaryPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            form.classList.remove("is-hidden");
            intakeLayout.classList.remove("is-success");

            summaryPanel.innerHTML = [
                '<p class="summary-eyebrow">Booking summary</p>',
                "<h3>Something went wrong while submitting the form.</h3>",
                '<p class="summary-text">You can try again, or use the email fallback below so your intake still reaches Khaled.</p>',
                '<div class="summary-block">',
                "<h4>Fallback option</h4>",
                '<div class="form-actions">',
                '<a class="button button-secondary" href="mailto:' + encodeURIComponent(config.contactEmail) + '?subject=' + mailtoSubject + '&body=' + mailtoBody + '">Email this intake</a>',
                bookingButton,
                "</div>",
                "</div>"
            ].join("");

            summaryPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });

    function buildRow(label, value) {
        return (
            '<div class="summary-row"><strong>' +
            escapeHtml(label) +
            "</strong><span>" +
            escapeHtml(value) +
            "</span></div>"
        );
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();
