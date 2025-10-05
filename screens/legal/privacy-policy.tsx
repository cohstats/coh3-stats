import { NextPage } from "next";
import { NextSeo } from "next-seo";
import { Container, Title, Text, Space, Anchor, List } from "@mantine/core";
import React, { useEffect } from "react";
import { generateKeywordsString } from "../../src/seo-utils";
import config from "../../config";

const PrivacyPolicy: NextPage = () => {
  useEffect(() => {
    // Analytics can be added here if needed
  }, []);

  return (
    <div>
      <NextSeo
        title="Privacy Policy - COH3 Stats"
        description="Privacy Policy for COH Stats - Learn how we collect and use information on coh3stats.com and the COH3 Stats Desktop App."
        canonical={`${config.SITE_URL}/legal/privacy`}
        additionalMetaTags={[
          {
            name: "keywords",
            content: generateKeywordsString(["privacy policy", "data protection", "gdpr"]),
          },
        ]}
      />
      <Container size="md" py="xl">
        <Title order={1} mb="xl">
          COH Stats — Privacy Policy
        </Title>

        <Text c="dimmed" mb="xl">
          Last updated: October 5, 2025
        </Text>

        <Text mb="md">
          This Privacy Policy explains how COH Stats ("COH Stats," "we," "us," "our") collects and
          uses information when you use our website coh3stats.com (the "Website") and our Windows
          desktop application COH3 Stats Desktop App (the "App"). We do not run user accounts, we
          do not sell anything, and we do not collect information to market to you. We collect
          only what we need to keep the Website and App running, understand usage, and diagnose
          problems.
        </Text>

        <Text mb="xl">
          Questions? Contact us at{" "}
          <Anchor href="mailto:info@coh3stats.com">info@coh3stats.com</Anchor>.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Summary (plain English)
        </Title>

        <List spacing="sm" mb="xl">
          <List.Item>We have no logins and no checkout.</List.Item>
          <List.Item>
            We do not store any contact information about our users (no emails, phone numbers).
          </List.Item>
          <List.Item>
            The only personal identifiers we store in our own systems are:
            <List withPadding mt="xs">
              <List.Item>Steam ID, and</List.Item>
              <List.Item>Company of Heroes 3 profile ID.</List.Item>
            </List>
            These are automatically gathered to power community stats and features on the site. We
            do not sell or share them for advertising.
          </List.Item>
          <List.Item>
            We use analytics and crash/error tools to keep things running: Google Analytics /
            Firebase (incl. Crashlytics), Sentry, Mixpanel (App only), and Cloudflare Analytics.
          </List.Item>
          <List.Item>Crashlytics crash data is retained for 90 days.</List.Item>
          <List.Item>The App is Windows-only.</List.Item>
        </List>

        <Title order={2} mt="xl" mb="md">
          Scope
        </Title>

        <Text mb="md">This Policy covers:</Text>
        <List spacing="xs" mb="xl">
          <List.Item>
            <Text fw={500}>Website:</Text> coh3stats.com
          </List.Item>
          <List.Item>
            <Text fw={500}>App:</Text> COH3 Stats Desktop App for Windows
          </List.Item>
        </List>

        <Title order={2} mt="xl" mb="md">
          What we collect (and what we don't)
        </Title>

        <Title order={3} mt="lg" mb="sm">
          We do not collect
        </Title>
        <Text mb="md">
          Names, emails, phone numbers, passwords, payment data, or marketing preferences.
        </Text>
        <Text mb="xl">User-generated content requiring accounts (we don't have accounts).</Text>

        <Title order={3} mt="lg" mb="sm">
          We may collect (automatically)
        </Title>
        <Text mb="md">Depending on your browser/device and the tool involved:</Text>
        <List spacing="sm" mb="md">
          <List.Item>
            <Text fw={500}>Usage data (Website & App):</Text> pages viewed, navigation events,
            referrer/UTM data, time spent, feature usage, language, screen resolution,
            app/OS/browser version.
          </List.Item>
          <List.Item>
            <Text fw={500}>Network/technical metadata:</Text> IP address, user agent, timestamps,
            request headers (used for analytics, security, and rate limiting).
          </List.Item>
          <List.Item>
            <Text fw={500}>Crash/diagnostic data (Website & App):</Text> stack traces, error
            messages, code paths, device/OS/app version, and related technical context.
          </List.Item>
          <List.Item>
            <Text fw={500}>Game identifiers we store in our systems:</Text> Steam ID and Company
            of Heroes 3 profile ID.
          </List.Item>
        </List>

        <Text mb="xl">
          In our own databases, the only personal identifiers we keep are Steam ID and COH3
          profile ID. Third-party analytics and security providers may process additional
          technical data (e.g., IP addresses, device/instance identifiers) in order to provide
          their services.
        </Text>

        <Text mb="xl">We do not intentionally collect sensitive categories of data.</Text>

        <Title order={2} mt="xl" mb="md">
          Why we collect it (legal bases)
        </Title>

        <Text mb="md">We process the above information to:</Text>
        <List spacing="xs" mb="md">
          <List.Item>
            Operate and secure the Website and App (detect outages, prevent abuse, debug issues).
          </List.Item>
          <List.Item>Measure and improve performance and features.</List.Item>
          <List.Item>Produce aggregate statistics that do not identify individuals.</List.Item>
        </List>

        <Text mb="xl">
          Where applicable (e.g., EU/UK), our legal bases are legitimate interests (Art. 6(1)(f)
          GDPR) to operate and improve our services and—where required for analytics
          cookies/identifiers—consent.
        </Text>

        <Title order={2} mt="xl" mb="md">
          The tools we use (processors)
        </Title>

        <Text mb="md">We use reputable providers that process data on our behalf:</Text>
        <List spacing="sm" mb="md">
          <List.Item>
            <Text fw={500}>
              Google Analytics / Firebase (incl. Crashlytics and Firebase Analytics)
            </Text>{" "}
            — Website/App analytics and crash reporting.
          </List.Item>
          <List.Item>
            <Text fw={500}>
              Cloudflare (incl. Cloudflare Web Analytics and security services)
            </Text>{" "}
            — privacy-focused web analytics and protection for the Website.
          </List.Item>
          <List.Item>
            <Text fw={500}>Sentry</Text> — error tracking for Website and App.
          </List.Item>
          <List.Item>
            <Text fw={500}>Mixpanel (App only)</Text> — event analytics (Windows app usage).
          </List.Item>
        </List>

        <Text mb="xl">
          These providers may store or process data outside your country. Where required, we rely
          on appropriate safeguards (e.g., standard contractual clauses) and have data processing
          terms in place with each provider.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Cookies, SDKs, and similar technologies
        </Title>

        <List spacing="sm" mb="md">
          <List.Item>
            <Text fw={500}>Website:</Text> may use first-party cookies or similar technologies for
            analytics and performance (e.g., Google Analytics) and Cloudflare's privacy-oriented
            measurement (which may be cookie-free). You can block or delete cookies in your
            browser settings.
          </List.Item>
          <List.Item>
            <Text fw={500}>App (Windows):</Text> uses embedded SDKs (Firebase/Crashlytics, Sentry,
            Mixpanel) that create runtime identifiers to measure usage and diagnose issues. These
            are not used for advertising.
          </List.Item>
        </List>

        <Text mb="xl">
          If your region requires consent for analytics cookies/identifiers, our Website will
          display a consent prompt. You can also adjust browser/OS privacy settings at any time.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Data retention
        </Title>

        <List spacing="sm" mb="md">
          <List.Item>
            <Text fw={500}>Crash logs (Firebase Crashlytics):</Text> retained for 90 days.
          </List.Item>
          <List.Item>
            <Text fw={500}>
              Other analytics events (Google Analytics/Firebase Analytics, Cloudflare Analytics,
              Mixpanel, Sentry):
            </Text>{" "}
            retained for the minimum period needed for analytics and diagnostics and then deleted
            or aggregated. Where tools provide configurable windows, we use reasonable defaults
            and purge/aggregate regularly.
          </List.Item>
          <List.Item>
            <Text fw={500}>Aggregated statistics:</Text> may be kept without a time limit (they do
            not identify you).
          </List.Item>
        </List>

        <Text mb="xl">
          We retain data only as long as needed for the purposes in this Policy or to comply with
          law.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Sharing and disclosures
        </Title>

        <Text mb="md">
          We do not sell your data and do not share it for behavioral advertising.
        </Text>

        <Text mb="md">We may disclose data to:</Text>
        <List spacing="sm" mb="xl">
          <List.Item>
            <Text fw={500}>Service providers (processors)</Text> listed above, strictly to help
            operate analytics, security, and error tracking.
          </List.Item>
          <List.Item>
            <Text fw={500}>Legal and safety:</Text> where required by law or to protect our
            rights, users, or the public.
          </List.Item>
          <List.Item>
            <Text fw={500}>Business transfers:</Text> if we undergo a reorganization or similar
            transaction, data relevant to providing the services may transfer under this Policy.
          </List.Item>
        </List>

        <Title order={2} mt="xl" mb="md">
          Your choices & controls
        </Title>

        <List spacing="sm" mb="md">
          <List.Item>
            <Text fw={500}>Browser/Device controls:</Text> Block or delete cookies; enable
            tracking protection; reset analytics/advertising IDs; use content blockers.
          </List.Item>
          <List.Item>
            <Text fw={500}>Consent & signals:</Text> Where supported, we honor cookie consent
            choices and applicable browser signals (e.g., Global Privacy Control) for Website
            analytics scope.
          </List.Item>
          <List.Item>
            <Text fw={500}>Requests to us:</Text> You can ask us to remove analytics/crash data
            reasonably linkable to your device or App install where feasible. To help us locate
            records, include any relevant identifiers (e.g., Steam ID, COH3 profile ID,
            approximate timestamps, OS/app version).
          </List.Item>
        </List>

        <Text mb="xl">
          Contact: <Anchor href="mailto:info@coh3stats.com">info@coh3stats.com</Anchor>
        </Text>

        <Title order={2} mt="xl" mb="md">
          Your rights (GDPR/EEA/UK and similar)
        </Title>

        <Text mb="md">
          Depending on your location, you may have rights to access, rectify, erase, restrict or
          object to processing, and data portability. Where we rely on consent, you may withdraw
          consent at any time (this does not affect processing already performed). You can also
          complain to your local data protection authority.
        </Text>

        <Text mb="xl">
          Contact us at <Anchor href="mailto:info@coh3stats.com">info@coh3stats.com</Anchor> to
          exercise your rights.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Children
        </Title>

        <Text mb="xl">
          Our services are not directed to children under 13 (or the age required by your
          country). We do not knowingly collect personal data from children. If you believe a
          child has provided data, contact us so we can delete it.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Security
        </Title>

        <Text mb="xl">
          We use reasonable technical and organizational measures (e.g., encryption in transit,
          access controls, least-privilege practices) to protect data. No method is 100% secure,
          but we work to prevent unauthorized access, use, or disclosure.
        </Text>

        <Title order={2} mt="xl" mb="md">
          International transfers
        </Title>

        <Text mb="xl">
          We and our processors may process data in countries with different data-protection laws.
          Where required, we use lawful transfer mechanisms (e.g., standard contractual clauses)
          and provider safeguards.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Changes to this Policy
        </Title>

        <Text mb="xl">
          We may update this Policy from time to time. We'll post the updated version here with a
          new "Last updated" date. If changes are material, we'll take additional steps required
          by law.
        </Text>

        <Title order={2} mt="xl" mb="md">
          Contact
        </Title>

        <Text mb="md" fw={500}>
          COH Stats
        </Text>
        <Text mb="xl">
          Email: <Anchor href="mailto:info@coh3stats.com">info@coh3stats.com</Anchor>
        </Text>

        <Space h="xl" />
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
