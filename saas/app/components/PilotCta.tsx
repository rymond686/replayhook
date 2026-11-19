"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "@/lib/site";
import { track } from "./Analytics";

export function PilotCta({ heading = "Apply for a paid pilot" }: { heading?: string }) {
  const [status, setStatus] = useState<"idle" | "submitted">("idle");

  function onClickApply() {
    void track("pilot_apply_click", "/en/pricing/");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject = encodeURIComponent("ReplayHook paid pilot application");
    const body = encodeURIComponent(
      `Contact email: ${email}\n\n${message || "(No additional details provided.)"}`,
    );
    void track("pilot_apply_submit", "/en/pricing/");
    setStatus("submitted");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="section" id="apply">
      <div className="panel">
        <h2>{heading}</h2>
        <p>
          Tell us about the Stripe payment and order mismatch you need to review. Applications
          are sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. This form does not
          upload secrets, webhook payloads, or customer lists.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <label>
            Work email
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            What do you need to reconcile?
            <textarea
              name="message"
              placeholder="Example: Stripe shows a succeeded PaymentIntent, but the matching order is still pending."
            />
          </label>
          <div className="actions">
            <button className="button" type="submit" onClick={onClickApply}>
              Apply for a paid pilot
            </button>
            <a className="button secondary" href={`mailto:${CONTACT_EMAIL}`} onClick={onClickApply}>
              Email instead
            </a>
          </div>
        </form>
        {status === "submitted" ? (
          <p className="muted">
            Your email client should open a draft to {CONTACT_EMAIL}. If it does not, send the
            application manually. The analytics event for this application does not include your
            email address or message.
          </p>
        ) : null}
      </div>
    </section>
  );
}
