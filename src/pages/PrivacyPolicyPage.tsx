import React from 'react';
import { theme } from '../styles/theme';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.xxl,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
        }}
      >
        <h1
          style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Vowable Privacy Policy
        </h1>
        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.xl,
            fontStyle: 'italic',
          }}
        >
          Last updated: 27-01-2026
        </p>

        <div
          style={{
            fontSize: theme.typography.fontSize.base,
            lineHeight: theme.typography.lineHeight.relaxed,
            color: theme.colors.text.primary,
          }}
        >
          <p style={{ marginBottom: theme.spacing.lg }}>
            Vowable ("we", "our", or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share information when you use our website, mobile application, or related services (collectively, the "Services").
          </p>
          <p style={{ marginBottom: theme.spacing.xl }}>
            By using Vowable, you agree to the practices described in this policy.
          </p>

          <hr
            style={{
              border: 'none',
              borderTop: `1px solid ${theme.colors.border}`,
              margin: `${theme.spacing.xl} 0`,
            }}
          />

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            1. Information We Collect
          </h2>

          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
            }}
          >
            1.1 Information You Provide
          </h3>
          <p style={{ marginBottom: theme.spacing.md }}>
            We may collect information you voluntarily provide, including:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Name and email address</li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Wedding planning details (e.g. date, location, budget ranges, preferences)
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Notes, saved vendors, checklists, and enquiries
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Communications you send through our Services
            </li>
          </ul>

          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
            }}
          >
            1.2 Information Collected Automatically
          </h3>
          <p style={{ marginBottom: theme.spacing.md }}>
            When you use our Services, we may automatically collect:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Device and browser information</li>
            <li style={{ marginBottom: theme.spacing.xs }}>IP address</li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Usage data (pages viewed, actions taken)
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Cookies or similar technologies for basic functionality and analytics
            </li>
          </ul>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            2. Third-Party Integrations
          </h2>

          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
            }}
          >
            2.1 Pinterest Integration
          </h3>
          <p style={{ marginBottom: theme.spacing.md }}>
            If you choose to connect Pinterest or view Pinterest content through Vowable:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>
              We may access limited information such as public boards, pins, or metadata, depending on permissions you grant.
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              We do not post to Pinterest on your behalf unless explicitly authorised.
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Pinterest's use of your information is governed by their Privacy Policy:{' '}
              <a
                href="https://policy.pinterest.com/en/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.colors.accent.primary,
                  textDecoration: 'underline',
                }}
              >
                https://policy.pinterest.com/en/privacy-policy
              </a>
            </li>
          </ul>
          <p style={{ marginBottom: theme.spacing.xl }}>
            You can revoke Pinterest access at any time through your Pinterest account settings.
          </p>

          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
            }}
          >
            2.2 Other External Services
          </h3>
          <p style={{ marginBottom: theme.spacing.xl }}>
            We may link to or integrate with third-party services (e.g. maps, accommodation platforms). These services operate independently and have their own privacy policies.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            3. How We Use Your Information
          </h2>
          <p style={{ marginBottom: theme.spacing.md }}>
            We use your information to:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Provide and improve the Vowable Services</li>
            <li style={{ marginBottom: theme.spacing.xs }}>Personalise your planning experience</li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Generate planning timelines, checklists, and recommendations
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Enable vendor discovery and enquiry tracking
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Communicate with you regarding your account or updates
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Maintain security and prevent misuse
            </li>
          </ul>
          <p style={{ marginBottom: theme.spacing.xl, fontWeight: theme.typography.fontWeight.medium }}>
            We do <strong>not</strong> sell your personal information.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            4. How We Share Information
          </h2>
          <p style={{ marginBottom: theme.spacing.md }}>
            We may share information:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>
              With service providers who help operate our platform (e.g. hosting, analytics)
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              When you choose to contact a vendor (only the information you provide is shared)
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              If required by law or to protect our rights and users
            </li>
          </ul>
          <p style={{ marginBottom: theme.spacing.xl }}>
            All third parties are required to protect your data and use it only for the intended purpose.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            5. Data Storage & Security
          </h2>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>
              Your data is stored securely using reputable cloud infrastructure.
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              We apply reasonable technical and organisational measures to protect your information.
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              No system is 100% secure; however, we take data protection seriously.
            </li>
          </ul>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            6. Your Rights & Choices
          </h2>
          <p style={{ marginBottom: theme.spacing.md }}>
            Depending on your location, you may have the right to:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.md,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Access your personal data</li>
            <li style={{ marginBottom: theme.spacing.xs }}>Request correction or deletion</li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Withdraw consent for certain processing
            </li>
            <li style={{ marginBottom: theme.spacing.xs }}>Request export of your data</li>
          </ul>
          <p style={{ marginBottom: theme.spacing.xl }}>
            You can manage most information directly through your account or contact us at the address below.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            7. Data Retention
          </h2>
          <p style={{ marginBottom: theme.spacing.md }}>
            We retain your information only as long as necessary to:
          </p>
          <ul
            style={{
              marginLeft: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
              paddingLeft: theme.spacing.md,
            }}
          >
            <li style={{ marginBottom: theme.spacing.xs }}>Provide the Services</li>
            <li style={{ marginBottom: theme.spacing.xs }}>Comply with legal obligations</li>
            <li style={{ marginBottom: theme.spacing.xs }}>
              Resolve disputes and enforce agreements
            </li>
          </ul>
          <p style={{ marginBottom: theme.spacing.xl }}>
            You may request deletion of your account and data at any time.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            8. Children's Privacy
          </h2>
          <p style={{ marginBottom: theme.spacing.xl }}>
            Vowable is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>

          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.md,
            }}
          >
            9. Changes to This Policy
          </h2>
          <p style={{ marginBottom: theme.spacing.xl }}>
            We may update this Privacy Policy from time to time.
            If changes are significant, we will notify you through the Services or by email.
          </p>
          <p style={{ marginBottom: theme.spacing.xl }}>
            The "Last updated" date at the top will always reflect the latest version.
          </p>
        </div>
      </div>
    </div>
  );
};
