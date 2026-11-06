import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { buildIfsResult } from "../../../utils/ifsResult.js";
import "./IFSExperiment3.css";
 
const RESULT_STORAGE_KEY = "emailTraceExp3Status";
 
/* =========================================================
   NOTE ON OBSERVATION HISTORY
 
   Observations are kept in React state only — NOT localStorage.
   The Observation Table clears automatically on page refresh
   and on Reset, so one learner's progress never leaks into the
   next session on the same device.
========================================================= */
 
/* =========================================================
   MAIL SAMPLES (eMailTracePro case files)
========================================================= */
 
const SAMPLES = [
  {
    id: "C1",
    label: "Case 1 — Bank account suspension notice",
    subject: "Urgent: Your account will be suspended",
    from: "alerts@securebank-verify.com",
    returnPath: "bounce@mailer-x9.ru",
    spf: "FAIL",
    dkim: "NONE",
    hops: 3,
    originIP: "185.220.101.47",
    country: "Russia",
    city: "Saint Petersburg",
    isp: "Nevalink LLC",
    asn: "AS48666",
    verdict: "Spoofed",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 4kP2n9;
        Mon, 14 Jul 2025 10:42:19 +0530
Received: from relay2.mailservice.net (relay2.mailservice.net [198.51.100.24])
        by mx.zenithtech.co.in with ESMTP id 7Fq1xR;
        Mon, 14 Jul 2025 10:42:11 +0530
Received: from smtp-out.mailer-x9.ru (unknown [185.220.101.47])
        by relay2.mailservice.net with SMTP id 2Za8Kd;
        Mon, 14 Jul 2025 10:41:58 +0530
Authentication-Results: mx.zenithtech.co.in; spf=fail; dkim=none
Return-Path: <bounce@mailer-x9.ru>
Message-ID: <9f21c7a@mailer-x9.ru>
From: "SecureBank Alerts" <alerts@securebank-verify.com>
To: student@zenithtech.co.in
Subject: Urgent: Your account will be suspended`,
  },
 
  {
    id: "C2",
    label: "Case 2 — Internal HR circular",
    subject: "Revised leave policy — effective 1 August",
    from: "hr@zenithtech.co.in",
    returnPath: "hr@zenithtech.co.in",
    spf: "PASS",
    dkim: "PASS",
    hops: 2,
    originIP: "103.86.12.190",
    country: "India",
    city: "Pune",
    isp: "Tata Communications",
    asn: "AS4755",
    verdict: "Genuine",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 8Lm4qP;
        Tue, 15 Jul 2025 09:15:02 +0530
Received: from smtp.zenithtech.co.in (smtp.zenithtech.co.in [103.86.12.190])
        by mx.zenithtech.co.in with ESMTPS id 3Nb7yT;
        Tue, 15 Jul 2025 09:14:56 +0530
Authentication-Results: mx.zenithtech.co.in; spf=pass; dkim=pass
Return-Path: <hr@zenithtech.co.in>
Message-ID: <a71bd20@zenithtech.co.in>
From: "Zenith HR" <hr@zenithtech.co.in>
To: student@zenithtech.co.in
Subject: Revised leave policy — effective 1 August`,
  },
 
  {
    id: "C3",
    label: "Case 3 — International lottery winning",
    subject: "Congratulations! You have won USD 2,500,000",
    from: "winner@lucky-draw-intl.com",
    returnPath: "noreply@bulkmail-hub.cn",
    spf: "FAIL",
    dkim: "NONE",
    hops: 3,
    originIP: "202.108.22.135",
    country: "China",
    city: "Beijing",
    isp: "China Unicom",
    asn: "AS4837",
    verdict: "Spoofed",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 6Rt9wQ;
        Wed, 16 Jul 2025 22:08:41 +0530
Received: from gate1.bulkmail-hub.cn (gate1.bulkmail-hub.cn [198.51.100.77])
        by mx.zenithtech.co.in with ESMTP id 1Yh5kL;
        Wed, 16 Jul 2025 22:08:33 +0530
Received: from mail.bulkmail-hub.cn (unknown [202.108.22.135])
        by gate1.bulkmail-hub.cn with SMTP id 5Dc2mN;
        Wed, 16 Jul 2025 22:08:20 +0530
Authentication-Results: mx.zenithtech.co.in; spf=fail; dkim=none
Return-Path: <noreply@bulkmail-hub.cn>
Message-ID: <55ee19b@bulkmail-hub.cn>
From: "Global Lucky Draw" <winner@lucky-draw-intl.com>
To: student@zenithtech.co.in
Subject: Congratulations! You have won USD 2,500,000`,
  },
 
  {
    id: "C4",
    label: "Case 4 — Vendor invoice",
    subject: "Invoice ORB-4471 for July supplies",
    from: "accounts@orbitsupplies.com",
    returnPath: "accounts@orbitsupplies.com",
    spf: "PASS",
    dkim: "PASS",
    hops: 2,
    originIP: "34.117.59.81",
    country: "United States",
    city: "Ashburn",
    isp: "Google LLC",
    asn: "AS15169",
    verdict: "Genuine",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 9Kp3vB;
        Thu, 17 Jul 2025 14:30:12 +0530
Received: from smtp.orbitsupplies.com (smtp.orbitsupplies.com [34.117.59.81])
        by mx.zenithtech.co.in with ESMTPS id 4Wq8zR;
        Thu, 17 Jul 2025 14:30:04 +0530
Authentication-Results: mx.zenithtech.co.in; spf=pass; dkim=pass
Return-Path: <accounts@orbitsupplies.com>
Message-ID: <c40aa91@orbitsupplies.com>
From: "Orbit Supplies Billing" <accounts@orbitsupplies.com>
To: student@zenithtech.co.in
Subject: Invoice ORB-4471 for July supplies`,
  },
 
  {
    id: "C5",
    label: "Case 5 — IT helpdesk password reset",
    subject: "Action required: verify your mailbox password",
    from: "it-support@zenithtech.co.in",
    returnPath: "admin@secure-login-alert.xyz",
    spf: "FAIL",
    dkim: "FAIL",
    hops: 3,
    originIP: "45.133.1.117",
    country: "Netherlands",
    city: "Amsterdam",
    isp: "Hostkey B.V.",
    asn: "AS57043",
    verdict: "Spoofed",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 2Hn6cF;
        Fri, 18 Jul 2025 11:02:55 +0530
Received: from edge.mailproxy.net (edge.mailproxy.net [198.51.100.203])
        by mx.zenithtech.co.in with ESMTP id 7Vs1dG;
        Fri, 18 Jul 2025 11:02:47 +0530
Received: from vps-4471.secure-login-alert.xyz (unknown [45.133.1.117])
        by edge.mailproxy.net with SMTP id 8Jx0pM;
        Fri, 18 Jul 2025 11:02:31 +0530
Authentication-Results: mx.zenithtech.co.in; spf=fail; dkim=fail
Return-Path: <admin@secure-login-alert.xyz>
Message-ID: <7bb3ce4@secure-login-alert.xyz>
From: "IT Helpdesk" <it-support@zenithtech.co.in>
To: student@zenithtech.co.in
Subject: Action required: verify your mailbox password`,
  },
 
  {
    id: "C6",
    label: "Case 6 — Technology newsletter",
    subject: "TechDigest Weekly — issue 214",
    from: "news@techdigest.io",
    returnPath: "bounce@mail.techdigest.io",
    spf: "PASS",
    dkim: "PASS",
    hops: 2,
    originIP: "167.89.45.23",
    country: "United States",
    city: "Denver",
    isp: "SendGrid Inc.",
    asn: "AS11377",
    verdict: "Genuine",
    rawHeader: `Delivered-To: student@zenithtech.co.in
Received: from mx.zenithtech.co.in (mx.zenithtech.co.in [103.21.58.10])
        by imap.zenithtech.co.in with ESMTPS id 5Qd7nZ;
        Sat, 19 Jul 2025 07:45:19 +0530
Received: from o1.mail.techdigest.io (o1.mail.techdigest.io [167.89.45.23])
        by mx.zenithtech.co.in with ESMTPS id 6Uy2hK;
        Sat, 19 Jul 2025 07:45:10 +0530
Authentication-Results: mx.zenithtech.co.in; spf=pass; dkim=pass
Return-Path: <bounce@mail.techdigest.io>
Message-ID: <e902fd5@mail.techdigest.io>
From: "TechDigest Weekly" <news@techdigest.io>
To: student@zenithtech.co.in
Subject: TechDigest Weekly — issue 214`,
  },
];
 
/* =========================================================
   eMailTracePro IP GEOLOCATION DATABASE
========================================================= */
 
const IP_DATABASE = [
  {
    ip: "34.117.59.81",
    country: "United States",
    city: "Ashburn",
    isp: "Google LLC",
    asn: "AS15169",
  },
  {
    ip: "45.133.1.117",
    country: "Netherlands",
    city: "Amsterdam",
    isp: "Hostkey B.V.",
    asn: "AS57043",
  },
  {
    ip: "103.21.58.10",
    country: "India",
    city: "Nashik",
    isp: "Zenith Campus Network",
    asn: "AS132453",
  },
  {
    ip: "103.86.12.190",
    country: "India",
    city: "Pune",
    isp: "Tata Communications",
    asn: "AS4755",
  },
  {
    ip: "167.89.45.23",
    country: "United States",
    city: "Denver",
    isp: "SendGrid Inc.",
    asn: "AS11377",
  },
  {
    ip: "185.220.101.47",
    country: "Russia",
    city: "Saint Petersburg",
    isp: "Nevalink LLC",
    asn: "AS48666",
  },
  {
    ip: "198.51.100.24",
    country: "Germany",
    city: "Frankfurt",
    isp: "MailService Relay GmbH",
    asn: "AS20940",
  },
  {
    ip: "198.51.100.77",
    country: "Singapore",
    city: "Singapore",
    isp: "BulkMail Gateway Pte",
    asn: "AS38001",
  },
  {
    ip: "198.51.100.203",
    country: "Germany",
    city: "Frankfurt",
    isp: "MailProxy Edge GmbH",
    asn: "AS20940",
  },
  {
    ip: "202.108.22.135",
    country: "China",
    city: "Beijing",
    isp: "China Unicom",
    asn: "AS4837",
  },
];
 
const VERDICT_OPTIONS = ["Genuine", "Spoofed", "Cannot determine"];
 
/* Each answer field says exactly WHAT to type and WHERE to read it from */
 
const HEADER_FIELDS = [
  {
    key: "from",
    label: "From address",
    where: 'Read the line starting with "From:"',
    help: "Type only the address inside < >, without the name in quotes.",
    placeholder: "someone@example.com",
  },
  {
    key: "returnPath",
    label: "Return-Path address",
    where: 'Read the line starting with "Return-Path:"',
    help: "Type only the address inside < >.",
    placeholder: "bounce@example.com",
  },
  {
    key: "spf",
    label: "SPF result",
    where: 'Read "Authentication-Results:" → the spf= value',
    help: "Type PASS, FAIL or NONE (in capitals).",
    placeholder: "PASS / FAIL / NONE",
  },
  {
    key: "dkim",
    label: "DKIM result",
    where: 'Read "Authentication-Results:" → the dkim= value',
    help: "Type PASS, FAIL or NONE (in capitals).",
    placeholder: "PASS / FAIL / NONE",
  },
];
 
const GEO_FIELDS = [
  {
    key: "country",
    label: "Country",
    where: "Copy from the highlighted row → Country column",
    help: "Spelling must match the table exactly.",
    placeholder: "e.g. India",
  },
  {
    key: "city",
    label: "City / Region",
    where: "Copy from the highlighted row → City column",
    help: "Spelling must match the table exactly.",
    placeholder: "e.g. Pune",
  },
  {
    key: "isp",
    label: "ISP / Organization",
    where: "Copy from the highlighted row → ISP column",
    help: "Include Ltd / LLC / Inc. exactly as shown.",
    placeholder: "e.g. Tata Communications",
  },
  {
    key: "asn",
    label: "ASN",
    where: "Copy from the highlighted row → ASN column",
    help: "Include the AS prefix, e.g. AS4755.",
    placeholder: "e.g. AS4755",
  },
];
 
/* =========================================================
   HELPERS
========================================================= */
 
function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}
 
function markField(entered, expected) {
  if (normalize(entered) === "") {
    return "wrong";
  }
 
  return normalize(entered) === normalize(expected)
    ? "correct"
    : "wrong";
}
 
function markFieldSet(fields, values, sample) {
  return fields.reduce((status, field) => {
    status[field.key] = markField(values[field.key], sample[field.key]);
    return status;
  }, {});
}
 
function allCorrect(statusObject) {
  return Object.values(statusObject).every(
    (item) => item === "correct"
  );
}
 
function hasWrong(statusObject) {
  return Object.values(statusObject).some(
    (item) => item === "wrong"
  );
}
 
function emptyValues(fields) {
  return fields.reduce((values, field) => {
    values[field.key] = "";
    return values;
  }, {});
}
 
function wrongLabels(fields, statusObject) {
  return fields
    .filter((field) => statusObject[field.key] === "wrong")
    .map((field) => field.label);
}
 
/* Splits the raw header into logical blocks and numbers the hops */
 
function buildHeaderBlocks(text) {
  const blocks = [];
 
  text.split("\n").forEach((line) => {
    if (/^\s/.test(line) && blocks.length) {
      blocks[blocks.length - 1].lines.push(line);
      return;
    }
 
    const match = line.match(/^([A-Za-z-]+):/);
 
    blocks.push({
      field: match ? match[1] : null,
      lines: [line],
    });
  });
 
  const totalReceived = blocks.filter(
    (block) => block.field === "Received"
  ).length;
 
  let seen = 0;
 
  blocks.forEach((block) => {
    if (block.field === "Received") {
      seen += 1;
      block.hop = totalReceived - seen + 1;
      block.isOldest = block.hop === 1;
    }
  });
 
  return blocks;
}
 
function renderLineTokens(line, lineKey) {
  const tokens = [];
 
  let rest = line;
 
  const fieldMatch = rest.match(/^([A-Za-z-]+):/);
 
  if (fieldMatch) {
    tokens.push(
      <span className="hdr-key" key={`${lineKey}-k`}>
        {fieldMatch[0]}
      </span>
    );
 
    rest = rest.slice(fieldMatch[0].length);
  }
 
  rest
    .split(/(\[\d{1,3}(?:\.\d{1,3}){3}\])/g)
    .forEach((segment, index) => {
      if (/^\[\d/.test(segment)) {
        tokens.push(
          <span className="hdr-ip" key={`${lineKey}-ip-${index}`}>
            {segment}
          </span>
        );
      } else if (segment) {
        tokens.push(
          <span key={`${lineKey}-t-${index}`}>{segment}</span>
        );
      }
    });
 
  return tokens;
}
 
/* =========================================================
   QUIZ
========================================================= */
 
const QUIZ = [
  {
    q: "Which email header field records the path a message travelled?",
    options: ["Subject", "Received", "To", "MIME-Version"],
    correct: 1,
  },
  {
    q: "In a raw header, which Received line represents the originating server?",
    options: [
      "The top-most Received line",
      "The bottom-most Received line",
      "Any middle Received line",
      "Received lines do not show origin",
    ],
    correct: 1,
  },
  {
    q: "What does a utility like eMailTracePro primarily extract?",
    options: [
      "The message body",
      "The originating IP address and relay route",
      "The recipient's password",
      "The attachment size",
    ],
    correct: 1,
  },
  {
    q: "The Return-Path header represents which address?",
    options: [
      "The displayed sender",
      "The envelope sender / bounce address",
      "The recipient mailbox",
      "The mail server hostname",
    ],
    correct: 1,
  },
  {
    q: "SPF verification checks whether:",
    options: [
      "The message body is encrypted",
      "The sending IP is authorised to send for that domain",
      "The subject line is genuine",
      "The attachment is virus free",
    ],
    correct: 1,
  },
  {
    q: "DKIM primarily provides:",
    options: [
      "Spam filtering",
      "A cryptographic signature verifying the signing domain and integrity",
      "IP geolocation",
      "Mailbox quota control",
    ],
    correct: 1,
  },
  {
    q: "A mismatch between the From domain and the Return-Path domain suggests:",
    options: [
      "Normal behaviour always",
      "Possible spoofing that needs further verification",
      "A hardware failure",
      "A larger mailbox",
    ],
    correct: 1,
  },
  {
    q: "Which header field is easiest for an attacker to forge?",
    options: ["Received", "From", "Message-ID", "Delivered-To"],
    correct: 1,
  },
  {
    q: "An IP geolocation lookup typically returns:",
    options: [
      "The exact house address of the sender",
      "Approximate country, city, ISP and ASN",
      "The sender's phone number",
      "The sender's mail password",
    ],
    correct: 1,
  },
  {
    q: "DMARC policy evaluation relies on:",
    options: [
      "Only the subject line",
      "SPF and DKIM results plus domain alignment",
      "The size of the mail",
      "The recipient's antivirus",
    ],
    correct: 1,
  },
  {
    q: "The Message-ID header is generated by:",
    options: [
      "The recipient's mail client",
      "The originating mail server",
      "The internet service provider",
      "The firewall",
    ],
    correct: 1,
  },
  {
    q: "New Received headers are added:",
    options: [
      "At the top, by each server that handles the mail",
      "At the bottom, by the recipient only",
      "Randomly anywhere in the header",
      "Only once by the sender",
    ],
    correct: 0,
  },
  {
    q: "The X-Originating-IP header, when present, usually shows:",
    options: [
      "The IP of the final relay",
      "The IP of the client that composed the message",
      "The IP of the recipient",
      "The IP of the DNS server",
    ],
    correct: 1,
  },
  {
    q: "The result 'spf=fail' means:",
    options: [
      "The mail server was offline",
      "The sending server is not authorised by the domain's SPF record",
      "The message had no subject",
      "The mail exceeded the size limit",
    ],
    correct: 1,
  },
  {
    q: "Which lookup maps an IP address to its registered owner?",
    options: ["PING", "WHOIS", "TRACEROUTE", "NSLOOKUP of MX"],
    correct: 1,
  },
  {
    q: "An ASN in a trace report identifies:",
    options: [
      "The antivirus signature",
      "The autonomous system / network operator holding the IP block",
      "The attachment type",
      "The mail client version",
    ],
    correct: 1,
  },
  {
    q: "A key limitation of IP geolocation in email tracing is:",
    options: [
      "It never returns a country",
      "VPNs, proxies and relays can mislead the result; accuracy is only approximate",
      "It works only for IPv6",
      "It requires the sender's consent",
    ],
    correct: 1,
  },
  {
    q: "A mail claiming to be from a national bank but originating from a foreign hosting provider is:",
    options: [
      "Always legitimate",
      "A strong phishing indicator requiring further checks",
      "Proof of a hardware fault",
      "Irrelevant to the investigation",
    ],
    correct: 1,
  },
  {
    q: "The main investigative purpose of tracing email origin is:",
    options: [
      "To increase mailbox size",
      "To identify the source for incident response and evidence",
      "To compress attachments",
      "To speed up delivery",
    ],
    correct: 1,
  },
  {
    q: "Which header shows the mailbox into which the message was finally delivered?",
    options: ["Delivered-To", "Reply-To", "Content-Type", "Date"],
    correct: 0,
  },
];
 
/* =========================================================
   DEFAULT PREVIEW
========================================================= */
 
const REFERENCE_HEADER = `Received: from mx.example.edu (mx.example.edu [103.21.58.10])
        by imap.example.edu with ESMTPS id 1Ab2Cd;
Received: from relay.mailhub.net (relay.mailhub.net [198.51.100.24])
        by mx.example.edu with ESMTP id 3Ef4Gh;
Received: from smtp.badsender.tld (unknown [185.220.101.47])
        by relay.mailhub.net with SMTP id 5Ij6Kl;
Authentication-Results: mx.example.edu; spf=fail; dkim=none
Return-Path: <bounce@badsender.tld>
From: "Bank Alerts" <alerts@secure-bank.example>`;
 
function DefaultPreview() {
  return (
    <div className="tc-preview-scroll">
      <div className="default-preview">
 
        <div className="default-example">
 
          <div className="example-row">
            <span className="example-label">Utility</span>
            <span className="example-value">eMailTracePro</span>
          </div>
 
          <div className="example-row">
            <span className="example-label">Input</span>
            <span className="example-value">Raw e-mail header</span>
          </div>
 
          <div className="example-row">
            <span className="example-label">Output</span>
            <span className="example-value">
              Origin IP + Geo + Verdict
            </span>
          </div>
 
        </div>
 
        <div className="tc-static-block">
          <h4 className="tc-static-title">
            What you will do in this experiment
          </h4>
          <p className="tc-static-theory">
            Step 1 — find the originating IP in the header.
            Step 2 — note the sender and SPF / DKIM results.
            Step 3 — look that IP up in the geolocation database.
            Step 4 — decide whether the mail is genuine or spoofed.
            Every step tells you exactly which line to read.
          </p>
        </div>
 
        <div className="tc-static-block">
          <h4 className="tc-static-title">
            Golden rule — read the header bottom-up
          </h4>
          <p className="tc-static-theory">
            Each server adds its Received line on top, so the
            LAST Received line (marked HOP 1 in the simulation)
            is the very first server — the origin. The IP inside
            its square brackets is the originating IP.
          </p>
        </div>
 
        <HighlightedHeader text={REFERENCE_HEADER} compact />
 
        <div className="default-word-preview">
          <span>Example result:</span>
          <b>185.220.101.47 → Russia / Nevalink LLC → SPOOFED</b>
        </div>
 
      </div>
    </div>
  );
}
 
/* =========================================================
   HEADER VIEWER (with hop badges + highlighting)
========================================================= */
 
function HighlightedHeader({
  text,
  activeFields = [],
  compact = false,
}) {
 
  const blocks = buildHeaderBlocks(text);
 
  return (
    <div className={`raw-header ${compact ? "compact" : ""}`}>
 
      {blocks.map((block, blockIndex) => {
 
        const isActive =
          block.field && activeFields.includes(block.field);
 
        return (
          <div
            className={`hdr-block ${
              block.field === "Received" ? "hdr-received" : ""
            } ${isActive ? "hdr-active" : ""} ${
              block.isOldest && isActive ? "hdr-origin" : ""
            }`}
            key={blockIndex}
          >
 
            {block.field === "Received" && (
              <div className="hop-badge">
                HOP {block.hop}
                {block.isOldest ? " · oldest" : ""}
              </div>
            )}
 
            <div className="hdr-lines">
              {block.lines.map((line, lineIndex) => (
                <div
                  className="hdr-line"
                  key={`${blockIndex}-${lineIndex}`}
                >
                  {renderLineTokens(
                    line,
                    `${blockIndex}-${lineIndex}`
                  )}
                </div>
              ))}
            </div>
 
          </div>
        );
      })}
 
    </div>
  );
}
 
function HeaderViewer({ sample, activeFields, caption }) {
  return (
    <div className="header-viewer">
 
      <div className="header-viewer-title">
        <span>RAW E-MAIL HEADER — {sample.id}</span>
        <span className="header-viewer-legend">
          highlighted = read this part
        </span>
      </div>
 
      <HighlightedHeader
        text={sample.rawHeader}
        activeFields={activeFields}
      />
 
      {caption && (
        <div className="header-viewer-caption">{caption}</div>
      )}
 
    </div>
  );
}
 
/* =========================================================
   SMALL UI PIECES
========================================================= */
 
function TaskBanner({ doThis, lookHere, format }) {
  return (
    <div className="task-banner">
 
      <div className="task-row">
        <span className="task-tag do">WHAT TO DO</span>
        <p>{doThis}</p>
      </div>
 
      <div className="task-row">
        <span className="task-tag look">WHERE TO LOOK</span>
        <p>{lookHere}</p>
      </div>
 
      {format && (
        <div className="task-row">
          <span className="task-tag fmt">FORMAT</span>
          <p>{format}</p>
        </div>
      )}
 
    </div>
  );
}
 
function Feedback({ feedback }) {
  if (!feedback) return null;
 
  return (
    <div className={`feedback-box feedback-${feedback.tone}`}>
      <span className="feedback-icon">
        {feedback.tone === "error" ? "✕" : "✓"}
      </span>
      <p>{feedback.text}</p>
    </div>
  );
}
 
function AnswerPanel({ title, children }) {
  return (
    <div className="answer-panel">
      <div className="answer-panel-title">{title}</div>
      {children}
    </div>
  );
}
 
function AnswerFields({
  fields,
  values,
  statuses,
  onChange,
  disabled,
}) {
  return (
    <div className="answer-grid">
 
      {fields.map((field) => {
 
        const status = statuses[field.key];
 
        return (
          <div className="answer-field" key={field.key}>
 
            <label className="answer-label">{field.label}</label>
 
            <span className="field-where">{field.where}</span>
 
            <input
              className={`answer-input ${
                status === "correct"
                  ? "answer-correct"
                  : status === "wrong"
                  ? "answer-wrong"
                  : ""
              }`}
              value={values[field.key] || ""}
              placeholder={field.placeholder}
              disabled={disabled}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
 
            <span className="field-help">{field.help}</span>
 
          </div>
        );
      })}
 
    </div>
  );
}
 
function IpDatabaseTable({ highlightIp }) {
  return (
    <div className="ip-db-wrap">
 
      <div className="ip-db-title">
        <span>eMailTracePro — IP Geolocation Database</span>
        <span className="ip-db-legend">
          yellow row = your traced IP
        </span>
      </div>
 
      <div className="ip-db-scroll">
 
        <table className="ip-db-table">
 
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Country</th>
              <th>City / Region</th>
              <th>ISP / Organization</th>
              <th>ASN</th>
            </tr>
          </thead>
 
          <tbody>
            {IP_DATABASE.map((record) => (
              <tr
                key={record.ip}
                className={
                  record.ip === highlightIp ? "ip-db-match" : ""
                }
              >
                <td>
                  {record.ip === highlightIp ? "➤ " : ""}
                  {record.ip}
                </td>
                <td>{record.country}</td>
                <td>{record.city}</td>
                <td>{record.isp}</td>
                <td>{record.asn}</td>
              </tr>
            ))}
          </tbody>
 
        </table>
 
      </div>
 
    </div>
  );
}
 
function StepChips({ phase }) {
 
  const labels = [
    "Origin IP",
    "Sender",
    "Geolocation",
    "Verdict",
  ];
 
  return (
    <div className="step-chips">
      {labels.map((label, index) => (
        <div
          className={`step-chip ${
            phase === index
              ? "current"
              : phase > index
              ? "done"
              : ""
          }`}
          key={label}
        >
          <b>{phase > index ? "✓" : index + 1}</b> {label}
        </div>
      ))}
    </div>
  );
}
 
/* =========================================================
   MANUAL CANVAS
========================================================= */
 
function ManualCanvasSimulation({
  sample,
  phase,
 
  ipInput,
  ipStatus,
  ipLocked,
 
  headerValues,
  headerStatus,
  headerLocked,
 
  geoValues,
  geoStatus,
  geoLocked,
 
  verdictChoice,
  verdictStatus,
  verdictLocked,
 
  feedback,
 
  onIpChange,
  onHeaderChange,
  onGeoChange,
  onVerdictChange,
 
  onCheckIp,
  onCheckHeader,
  onCheckGeo,
  onCheckVerdict,
 
  onContinue,
  onNewTrace,
  onTryAgain,
}) {
  return (
    <div className="canvas-sim">
      <div className="sim-content">
 
        {phase < 4 && <StepChips phase={phase} />}
 
        {/* STEP 1 */}
 
        {phase === 0 && (
          <div className="manual-step-block">
 
            <div className="manual-step-title">
              Step 1 of 4 — Find the Originating IP Address
            </div>
 
            <TaskBanner
              doThis="Type the IP address of the very first server that handled this mail."
              lookHere="In the header below, go to the Received block marked HOP 1 · oldest (the last Received block). The IP is the yellow value inside the square brackets [ ]."
              format="Only digits and dots, e.g. 203.0.113.9 — do not type the brackets."
            />
 
            <HeaderViewer
              sample={sample}
              activeFields={["Received"]}
              caption="Servers add their line on top, so the bottom-most Received block is the oldest = origin."
            />
 
            <AnswerPanel title="YOUR ANSWER — Originating IP Address">
 
              <input
                className={`answer-input ip-input ${
                  ipStatus === "correct"
                    ? "answer-correct"
                    : ipStatus === "wrong"
                    ? "answer-wrong"
                    : ""
                }`}
                value={ipInput}
                placeholder="Type the IP from HOP 1 here"
                disabled={ipLocked}
                onChange={(e) => onIpChange(e.target.value)}
              />
 
              <span className="field-help">
                IPs from HOP 2 / HOP 3 belong to relay servers and
                are not the origin.
              </span>
 
            </AnswerPanel>
 
            <Feedback feedback={feedback} />
 
            <div className="canvas-actions">
 
              {!ipLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckIp}
                  >
                    ✓ Check Origin IP
                  </button>
 
                  {ipStatus === "wrong" && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() => onTryAgain(0)}
                    >
                      ↻ Clear & Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() => onContinue(1)}
                >
                  Continue → Step 2
                </button>
              )}
 
            </div>
 
          </div>
        )}
 
        {/* STEP 2 */}
 
        {phase === 1 && (
          <div className="manual-step-block">
 
            <div className="manual-step-title">
              Step 2 of 4 — Record Sender and Authentication Details
            </div>
 
            <TaskBanner
              doThis="Fill the four boxes by copying values from the header."
              lookHere="From: line, Return-Path: line and the Authentication-Results: line (all highlighted below)."
              format="Addresses without < > and without the display name. SPF / DKIM in capitals: PASS, FAIL or NONE."
            />
 
            <HeaderViewer
              sample={sample}
              activeFields={[
                "From",
                "Return-Path",
                "Authentication-Results",
              ]}
              caption='Example: From: "IT Desk" <it@abc.com>  →  type  it@abc.com'
            />
 
            <AnswerPanel title="YOUR ANSWER — 4 fields">
 
              <AnswerFields
                fields={HEADER_FIELDS}
                values={headerValues}
                statuses={headerStatus}
                onChange={onHeaderChange}
                disabled={headerLocked}
              />
 
            </AnswerPanel>
 
            <Feedback feedback={feedback} />
 
            <div className="canvas-actions">
 
              {!headerLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckHeader}
                  >
                    ✓ Check Fields
                  </button>
 
                  {hasWrong(headerStatus) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() => onTryAgain(1)}
                    >
                      ↻ Clear & Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() => onContinue(2)}
                >
                  Continue → Step 3
                </button>
              )}
 
            </div>
 
          </div>
        )}
 
        {/* STEP 3 */}
 
        {phase === 2 && (
          <div className="manual-step-block">
 
            <div className="manual-step-title">
              Step 3 of 4 — Geolocate the Originating IP
            </div>
 
            <TaskBanner
              doThis="Find your traced IP in the database and copy its Country, City, ISP and ASN."
              lookHere={`The highlighted yellow row of the table below — IP ${sample.originIP}.`}
              format="Copy the text exactly as printed in the table, including AS prefix in the ASN."
            />
 
            <div className="traced-ip-chip">
              Traced Origin IP: <b>{sample.originIP}</b>
            </div>
 
            <IpDatabaseTable highlightIp={sample.originIP} />
 
            <div className="word-arrow">↓</div>
 
            <AnswerPanel title="YOUR ANSWER — Trace Report">
 
              <AnswerFields
                fields={GEO_FIELDS}
                values={geoValues}
                statuses={geoStatus}
                onChange={onGeoChange}
                disabled={geoLocked}
              />
 
            </AnswerPanel>
 
            <Feedback feedback={feedback} />
 
            <div className="canvas-actions">
 
              {!geoLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckGeo}
                  >
                    ✓ Check Trace Report
                  </button>
 
                  {hasWrong(geoStatus) && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() => onTryAgain(2)}
                    >
                      ↻ Clear & Try Again
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="canvas-btn decrypt-btn"
                  onClick={() => onContinue(3)}
                >
                  Continue → Step 4
                </button>
              )}
 
            </div>
 
          </div>
        )}
 
        {/* STEP 4 */}
 
        {phase === 3 && (
          <div className="manual-step-block">
 
            <div className="manual-step-title">
              Step 4 of 4 — Conclude the Investigation
            </div>
 
            <TaskBanner
              doThis="Click one verdict button and then press Check Verdict."
              lookHere="The evidence summary below — compare the two domains and the SPF / DKIM results."
              format="Spoofed → SPF or DKIM fails AND the Return-Path domain is unrelated to the From domain. Genuine → SPF and DKIM pass AND the Return-Path is the same domain or its sub-domain (mail.abc.com counts as abc.com)."
            />
 
            <div className="evidence-box">
 
              <div className="evidence-row">
                <span>From domain</span>
                <strong>{sample.from}</strong>
              </div>
 
              <div className="evidence-row">
                <span>Return-Path domain</span>
                <strong>{sample.returnPath}</strong>
              </div>
 
              <div className="evidence-row">
                <span>SPF / DKIM</span>
                <strong>
                  {sample.spf} / {sample.dkim}
                </strong>
              </div>
 
              <div className="evidence-row">
                <span>Origin IP</span>
                <strong>{sample.originIP}</strong>
              </div>
 
              <div className="evidence-row">
                <span>Location</span>
                <strong>
                  {sample.city}, {sample.country} — {sample.isp}
                </strong>
              </div>
 
            </div>
 
            <div className="word-arrow">↓</div>
 
            <AnswerPanel title="YOUR ANSWER — Select the verdict">
 
              <div className="verdict-options">
 
                {VERDICT_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    disabled={verdictLocked}
                    className={`verdict-option ${
                      verdictChoice === option
                        ? "verdict-selected"
                        : ""
                    } ${
                      verdictChoice === option &&
                      verdictStatus === "correct"
                        ? "answer-correct"
                        : verdictChoice === option &&
                          verdictStatus === "wrong"
                        ? "answer-wrong"
                        : ""
                    }`}
                    onClick={() => onVerdictChange(option)}
                  >
                    {option}
                  </button>
                ))}
 
              </div>
 
            </AnswerPanel>
 
            <Feedback feedback={feedback} />
 
            <div className="canvas-actions">
 
              {!verdictLocked ? (
                <>
                  <button
                    type="button"
                    className="canvas-btn check-btn"
                    onClick={onCheckVerdict}
                  >
                    ✓ Check Verdict
                  </button>
 
                  {verdictStatus === "wrong" && (
                    <button
                      type="button"
                      className="canvas-btn retry-btn"
                      onClick={() => onTryAgain(3)}
                    >
                      ↻ Clear & Try Again
                    </button>
                  )}
                </>
              ) : (
                <div className="success-message">
                  ✓ Trace Completed
                </div>
              )}
 
            </div>
 
          </div>
        )}
 
        {/* FINAL SCREEN */}
 
        {phase === 4 && (
          <div className="final-output-screen">
 
            <div className="final-output-header">
 
              <div className="final-success-icon">✓</div>
 
              <h2>Trace Completed Successfully</h2>
 
              <p>
                The origin of the selected e-mail has been traced
                and classified.
              </p>
 
            </div>
 
            <div className="final-output-box">
 
              <div className="final-output-row">
                <span>Case</span>
                <strong>{sample.label}</strong>
              </div>
 
              <div className="final-output-row">
                <span>Subject</span>
                <strong>{sample.subject}</strong>
              </div>
 
              <div className="final-output-row">
                <span>Origin IP</span>
                <strong>{sample.originIP}</strong>
              </div>
 
              <div className="final-output-row">
                <span>Location</span>
                <strong>
                  {sample.city}, {sample.country}
                </strong>
              </div>
 
              <div className="final-output-row">
                <span>ISP / ASN</span>
                <strong>
                  {sample.isp} ({sample.asn})
                </strong>
              </div>
 
              <div className="final-output-row final-cipher-row">
                <span>Verdict</span>
                <strong>{sample.verdict}</strong>
              </div>
 
            </div>
 
            <div className="final-output-note">
              ✓ This successful trace has been added to the
              Observation Table. Click New Trace and pick the next
              case file.
            </div>
 
            <div className="canvas-actions final-actions">
 
              <button
                type="button"
                className="canvas-btn new-word-btn"
                onClick={onNewTrace}
              >
                ＋ New Trace
              </button>
 
            </div>
 
          </div>
        )}
 
      </div>
    </div>
  );
}
 
/* =========================================================
   ASSIGNMENT
========================================================= */
 
function AssignmentScreen({ answers, setAnswers }) {
 
  const selectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) =>
      prev.map((value, index) =>
        index === qIndex ? optionIndex : value
      )
    );
  };
 
  return (
    <section className="card quiz-card">
 
      <div className="quiz-header">
 
        <div>
          <h3 className="panel-heading">
            Assignment — 20 Questions
          </h3>
 
          <p className="input-hint">
            Answer all questions based on the e-mail origin
            tracing simulation.
          </p>
        </div>
 
        <div className="quiz-count">
          {answers.filter((a) => a !== null).length}/20 Answered
        </div>
 
      </div>
 
      <div className="quiz-list">
 
        {QUIZ.map((item, qIndex) => (
 
          <div key={qIndex} className="quiz-question">
 
            <p className="quiz-question-text">
              <b>Q{qIndex + 1}.</b> {item.q}
            </p>
 
            <div className="quiz-options">
 
              {item.options.map((option, optionIndex) => {
 
                let optionClass = "quiz-option";
 
                if (answers[qIndex] === optionIndex) {
                  optionClass += " quiz-selected";
                }
 
                return (
                  <button
                    type="button"
                    key={optionIndex}
                    className={optionClass}
                    onClick={() =>
                      selectAnswer(qIndex, optionIndex)
                    }
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
 
                    <span>{option}</span>
                  </button>
                );
              })}
 
            </div>
 
          </div>
        ))}
 
      </div>
 
      <div className="assignment-note">
 
        <span>ℹ</span>
 
        <p>
          Select an answer for all 20 questions. Your assignment
          score will be calculated automatically when you submit.
        </p>
 
      </div>
 
    </section>
  );
}
 
/* =========================================================
   MESSAGE POPUP
========================================================= */
 
function MessagePopup({ popup, onClose }) {
  if (!popup) return null;
 
  return (
    <div className="popup-overlay" onClick={onClose}>
 
      <div
        className={`popup-box msg-popup msg-${popup.tone}`}
        onClick={(e) => e.stopPropagation()}
      >
 
        <div className="msg-popup-head">
          <span className="msg-popup-icon">
            {popup.tone === "error" ? "✕" : "✓"}
          </span>
 
          <h3>{popup.title}</h3>
        </div>
 
        <p className="msg-popup-text">{popup.text}</p>
 
        {popup.hint && (
          <div className="msg-popup-hint">
            <b>Hint:</b> {popup.hint}
          </div>
        )}
 
        <button
          className="btn-verify full-width"
          onClick={onClose}
        >
          OK, got it
        </button>
 
      </div>
 
    </div>
  );
}
 
/* =========================================================
   MAIN COMPONENT
========================================================= */
 
export default function EmailTraceExperiment() {
 
  const navigate = useNavigate();
 
  const [activeTab, setActiveTab] = useState("simulation");
 
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [procOpen, setProcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
 
  const [popup, setPopup] = useState(null);
  const [feedback, setFeedback] = useState(null);
 
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [sample, setSample] = useState(null);
 
  const [phase, setPhase] = useState(0);
 
  const [simulationStarted, setSimulationStarted] =
    useState(false);
 
  /* STEP 1 */
  const [ipInput, setIpInput] = useState("");
  const [ipStatus, setIpStatus] = useState(null);
  const [ipLocked, setIpLocked] = useState(false);
 
  /* STEP 2 */
  const [headerValues, setHeaderValues] = useState(
    emptyValues(HEADER_FIELDS)
  );
  const [headerStatus, setHeaderStatus] = useState({});
  const [headerLocked, setHeaderLocked] = useState(false);
 
  /* STEP 3 */
  const [geoValues, setGeoValues] = useState(
    emptyValues(GEO_FIELDS)
  );
  const [geoStatus, setGeoStatus] = useState({});
  const [geoLocked, setGeoLocked] = useState(false);
 
  /* STEP 4 */
  const [verdictChoice, setVerdictChoice] = useState("");
  const [verdictStatus, setVerdictStatus] = useState(null);
  const [verdictLocked, setVerdictLocked] = useState(false);
 
  /* OBSERVATIONS (in-memory only) */
  const [observations, setObservations] = useState([]);
 
  const [successfulAttempts, setSuccessfulAttempts] =
    useState(0);
 
  useEffect(() => {
    setSuccessfulAttempts(Math.min(observations.length, 5));
  }, [observations]);
 
  const [answers, setAnswers] = useState(
    Array(QUIZ.length).fill(null)
  );
 
  const [submitted, setSubmitted] = useState(false);
 
  const simulationCompleted = successfulAttempts >= 5;
 
  const allAssignmentAnswered = answers.every(
    (a) => a !== null
  );
 
  const completedCaseIds = observations.map((row) => row.caseId);
 
  const showPopup = (tone, title, text, hint) => {
    setPopup({ tone, title, text, hint });
  };
 
  /* =====================================================
     START TRACE
  ===================================================== */
 
  const handleStartTrace = () => {
 
    const selected = SAMPLES.find(
      (item) => item.id === selectedCaseId
    );
 
    if (!selected) {
      showPopup(
        "error",
        "No case file selected",
        "Please choose an e-mail case file from the dropdown before starting the trace.",
        "The dropdown is in the Inputs panel on the left."
      );
      return;
    }
 
    setSample(selected);
 
    setIpInput("");
    setIpStatus(null);
    setIpLocked(false);
 
    setHeaderValues(emptyValues(HEADER_FIELDS));
    setHeaderStatus({});
    setHeaderLocked(false);
 
    setGeoValues(emptyValues(GEO_FIELDS));
    setGeoStatus({});
    setGeoLocked(false);
 
    setVerdictChoice("");
    setVerdictStatus(null);
    setVerdictLocked(false);
 
    setFeedback(null);
    setPhase(0);
    setSimulationStarted(true);
  };
 
  /* =====================================================
     STEP 1 CHECK
  ===================================================== */
 
  const handleCheckIp = () => {
 
    if (!ipInput.trim()) {
      setFeedback({
        tone: "error",
        text: "The answer box is empty. Type the IP address from the HOP 1 block.",
      });
 
      showPopup(
        "error",
        "Nothing entered",
        "The answer box is empty. Type the IP address written inside the square brackets of the HOP 1 · oldest Received block.",
        "Example format: 203.0.113.9"
      );
 
      return;
    }
 
    const status = markField(ipInput, sample.originIP);
 
    setIpStatus(status);
 
    if (status === "correct") {
      setIpLocked(true);
 
      setFeedback({
        tone: "success",
        text: "Correct — this is the originating IP. Click Continue for Step 2.",
      });
 
      return;
    }
 
    setFeedback({
      tone: "error",
      text: "That is not the origin IP. It probably belongs to a relay (HOP 2 or HOP 3). Read the LAST Received block.",
    });
 
    showPopup(
      "error",
      "Wrong IP address",
      "The IP you entered is not the originating IP of this message. Relay servers also print their IPs, so make sure you are reading the last Received block — the one marked HOP 1 · oldest.",
      "Copy only the digits inside [ ], for example [203.0.113.9] → 203.0.113.9"
    );
  };
 
  /* =====================================================
     STEP 2 CHECK
  ===================================================== */
 
  const handleCheckHeader = () => {
 
    const status = markFieldSet(
      HEADER_FIELDS,
      headerValues,
      sample
    );
 
    setHeaderStatus(status);
 
    if (allCorrect(status)) {
      setHeaderLocked(true);
 
      setFeedback({
        tone: "success",
        text: "All four fields are correct. Click Continue for Step 3.",
      });
 
      return;
    }
 
    const wrong = wrongLabels(HEADER_FIELDS, status);
 
    setFeedback({
      tone: "error",
      text: `Check these field(s): ${wrong.join(", ")}. The red boxes are the wrong ones.`,
    });
 
    showPopup(
      "error",
      "Some fields are incorrect",
      `The following field(s) do not match the header: ${wrong.join(
        ", "
      )}. Each wrong box is outlined in red.`,
      'Type addresses without the display name and without < >. SPF / DKIM must be PASS, FAIL or NONE in capitals.'
    );
  };
 
  /* =====================================================
     STEP 3 CHECK
  ===================================================== */
 
  const handleCheckGeo = () => {
 
    const status = markFieldSet(GEO_FIELDS, geoValues, sample);
 
    setGeoStatus(status);
 
    if (allCorrect(status)) {
      setGeoLocked(true);
 
      setFeedback({
        tone: "success",
        text: "Trace report matches the database. Click Continue for Step 4.",
      });
 
      return;
    }
 
    const wrong = wrongLabels(GEO_FIELDS, status);
 
    setFeedback({
      tone: "error",
      text: `Check these field(s): ${wrong.join(", ")}. Copy them from the highlighted yellow row.`,
    });
 
    showPopup(
      "error",
      "Trace report does not match",
      `These field(s) are wrong: ${wrong.join(
        ", "
      )}. Copy the values only from the highlighted yellow row of the database — the row for IP ${
        sample.originIP
      }.`,
      "Spelling must match exactly, and the ASN must include the AS prefix."
    );
  };
 
  /* =====================================================
     STEP 4 CHECK + SAVE OBSERVATION
  ===================================================== */
 
  const handleCheckVerdict = () => {
 
    if (!verdictChoice) {
      setFeedback({
        tone: "error",
        text: "No verdict selected. Click one of the three buttons first.",
      });
 
      showPopup(
        "error",
        "No verdict selected",
        "Please click one of the three verdict buttons before checking.",
        "Use the SPF / DKIM results and the two domains shown in the evidence box."
      );
 
      return;
    }
 
    const status =
      normalize(verdictChoice) === normalize(sample.verdict)
        ? "correct"
        : "wrong";
 
    setVerdictStatus(status);
 
    if (status !== "correct") {
      setFeedback({
        tone: "error",
        text: "Wrong verdict. Re-read the SPF / DKIM results and compare the From and Return-Path domains.",
      });
 
      showPopup(
        "error",
        "Wrong verdict",
        `The evidence says SPF = ${sample.spf} and DKIM = ${sample.dkim}, with From domain "${sample.from}" and Return-Path "${sample.returnPath}". Compare the two domains again.`,
        "Fail + unrelated domain → Spoofed. Pass + same domain or its sub-domain → Genuine."
      );
 
      return;
    }
 
    setVerdictLocked(true);
 
    setFeedback({
      tone: "success",
      text: "Correct verdict — the trace is complete.",
    });
 
    setObservations((prev) => {
 
      /* Stop adding observations after 5 */
      if (prev.length >= 5) {
        return prev;
      }
 
      const newObservation = {
        attempt: prev.length + 1,
        caseId: sample.id,
        caseLabel: sample.label,
        subject: sample.subject,
        originIP: sample.originIP,
        location: `${sample.city}, ${sample.country}`,
        isp: `${sample.isp} (${sample.asn})`,
        verdict: sample.verdict,
        status: "Complete",
        timestamp: new Date().toISOString(),
      };
 
      return [...prev, newObservation];
    });
 
    setPhase(4);
  };
 
  /* =====================================================
     TRY AGAIN
  ===================================================== */
 
  const handleTryAgain = (step) => {
 
    setFeedback(null);
 
    if (step === 0) {
      setIpInput("");
      setIpStatus(null);
      setIpLocked(false);
    }
 
    if (step === 1) {
      setHeaderValues(emptyValues(HEADER_FIELDS));
      setHeaderStatus({});
      setHeaderLocked(false);
    }
 
    if (step === 2) {
      setGeoValues(emptyValues(GEO_FIELDS));
      setGeoStatus({});
      setGeoLocked(false);
    }
 
    if (step === 3) {
      setVerdictChoice("");
      setVerdictStatus(null);
      setVerdictLocked(false);
    }
  };
 
  /* =====================================================
     CONTINUE
  ===================================================== */
 
  const handleContinue = (nextPhase) => {
    setFeedback(null);
    setPhase(nextPhase);
  };
 
  /* =====================================================
     NEW TRACE
  ===================================================== */
 
  const handleNewTrace = () => {
 
    setSelectedCaseId("");
    setSample(null);
 
    setIpInput("");
    setIpStatus(null);
    setIpLocked(false);
 
    setHeaderValues(emptyValues(HEADER_FIELDS));
    setHeaderStatus({});
    setHeaderLocked(false);
 
    setGeoValues(emptyValues(GEO_FIELDS));
    setGeoStatus({});
    setGeoLocked(false);
 
    setVerdictChoice("");
    setVerdictStatus(null);
    setVerdictLocked(false);
 
    setFeedback(null);
    setPhase(0);
    setSimulationStarted(false);
  };
 
  /* =====================================================
     RESET
  ===================================================== */
 
  const handleReset = () => {
 
    handleNewTrace();
 
    setObservations([]);
 
    setActiveTab("simulation");
 
    setAnswers(Array(QUIZ.length).fill(null));
 
    setSubmitted(false);
  };
 
  /* =====================================================
     SUBMIT
  ===================================================== */
 
  const handleSubmit = () => {
 
    const unanswered = answers.some((answer) => answer === null);
 
    if (unanswered) {
      showPopup(
        "error",
        "Assignment incomplete",
        "Please answer all 20 questions in the Assignment tab before submitting.",
        "The counter at the top of the Assignment tab shows how many are answered."
      );
 
      setActiveTab("assignment");
      return;
    }
 
    if (submitted) return;
 
    if (!simulationCompleted) {
      showPopup(
        "error",
        "Simulation incomplete",
        `You have completed ${observations.length} of 5 traces. Complete all 5 successful traces before submitting.`,
        "Pick a different case file from the dropdown for each trace."
      );
 
      setActiveTab("simulation");
      return;
    }
 
    const quizScore = answers.reduce(
      (total, answer, index) =>
        total + (answer === QUIZ[index].correct ? 1 : 0),
      0
    );
 
    const resultData = buildIfsResult({
      completed: true,
 
      experimentNo: 3,
 
      experimentName:
        "Tracing of E-mail Origin using eMailTracePro Utility",
 
      experimentRoute: "/ifs-experiment-3",
 
      successfulAttempts: Math.min(observations.length, 5),
 
      totalRequiredAttempts: 5,
 
      simulationCompleted: observations.length >= 5,
 
      observations,
 
      quizScore,
 
      quizTotal: QUIZ.length,
 
      correctCount: quizScore,
 
      incorrectCount: QUIZ.length - quizScore,
 
      quizAnswers: answers,
 
      quizQuestions: QUIZ,
 
      date: new Date().toISOString(),
    });
 
    try {
      // Preserve the experiment-specific result and also save the
      // common result-page payload so View Answers works after refresh.
      localStorage.setItem(
        RESULT_STORAGE_KEY,
        JSON.stringify(resultData)
      );
      localStorage.setItem(
        "assignmentResult",
        JSON.stringify(resultData)
      );
    } catch (error) {
      console.error("Error saving result:", error);
 
      showPopup(
        "error",
        "Could not save locally",
        "Your result could not be saved in this browser. Make sure the confirmation screen loads before closing this tab."
      );
    }
 
    setSubmitted(true);
 
    setObservations([]);
 
    navigate("/result", { state: resultData });
  };
 
  /* =====================================================
     RENDER
  ===================================================== */
 
  return (
    <div className="emailtrace-root">
 
      <header className="exp-header">
 
        <button
          className="btn-back"
          onClick={() => navigate("/ifs-experiments")}
        >
          ← Back
        </button>
 
        <h1 className="exp-title">
          Experiment 3: Tracing of E-mail Origin using
          eMailTracePro Utility
        </h1>
 
        <button
          className="btn-help"
          onClick={() => setHelpOpen(true)}
        >
          ? Help
        </button>
 
      </header>
 
      <section className="card">
 
        <h2 className="section-heading orange">Aim</h2>
 
        <p>
          To trace the origin of an e-mail message using the
          eMailTracePro utility by analysing the raw message
          header, identifying the originating IP address,
          geolocating it, and determining whether the message is
          genuine or spoofed.
        </p>
 
      </section>
 
      <section className="card">
 
        <div
          className="collapsible-header"
          onClick={() => setTheoryOpen((v) => !v)}
        >
          <h2 className="section-heading orange">Theory</h2>
 
          <span className="chevron">
            {theoryOpen ? "▲" : "▼"}
          </span>
        </div>
 
        {theoryOpen && (
          <div className="collapsible-body">
 
            <p>
              Every e-mail carries a header that records the
              complete journey of the message. Each mail server
              that handles the message inserts a new Received line
              at the top of the header, so the header is read from
              bottom to top to reconstruct the route.
            </p>
 
            <p>
              <b>Process:</b>
            </p>
 
            <ol>
              <li>Obtain the raw (full) message header.</li>
              <li>
                Read the Received chain bottom-up to find the
                originating server and its IP address.
              </li>
              <li>
                Record From, Return-Path and the SPF / DKIM
                authentication results.
              </li>
              <li>
                Geolocate the origin IP to obtain country, city,
                ISP and ASN.
              </li>
              <li>
                Correlate all evidence to classify the mail as
                genuine or spoofed.
              </li>
            </ol>
 
            <p>
              The From field can be forged easily, whereas the
              Received chain is added by the servers themselves
              and is far harder to falsify, which makes it the key
              evidence in tracing.
            </p>
 
          </div>
        )}
 
      </section>
 
      <section className="card">
 
        <div
          className="collapsible-header"
          onClick={() => setProcOpen((v) => !v)}
        >
          <h2 className="section-heading orange">Procedure</h2>
 
          <span className="chevron">
            {procOpen ? "▲" : "▼"}
          </span>
        </div>
 
        {procOpen && (
          <div className="collapsible-body proc-grid">
 
            <ol className="proc-col">
              <li>Select an e-mail case file from the dropdown.</li>
              <li>Click Start Trace.</li>
              <li>
                Step 1 — copy the IP from the HOP 1 Received block.
              </li>
              <li>
                Step 2 — copy From, Return-Path, SPF and DKIM.
              </li>
              <li>
                Step 3 — copy the geo details of the highlighted
                row.
              </li>
            </ol>
 
            <ol className="proc-col" start="6">
              <li>Step 4 — select the correct verdict.</li>
              <li>Click New Trace and repeat with another case.</li>
              <li>Complete 5 successful traces.</li>
              <li>Answer all 20 assignment questions.</li>
              <li>Submit the experiment.</li>
            </ol>
 
          </div>
        )}
 
      </section>
 
      <div className="experiment-tabs">
 
        <button
          type="button"
          className={`experiment-tab ${
            activeTab === "simulation" ? "active" : ""
          }`}
          onClick={() => setActiveTab("simulation")}
        >
          🧪 Simulation
 
          {simulationCompleted && (
            <span className="tab-check">✓</span>
          )}
        </button>
 
        <button
          type="button"
          className={`experiment-tab ${
            activeTab === "assignment" ? "active" : ""
          }`}
          onClick={() => setActiveTab("assignment")}
        >
          📝 Assignment
        </button>
 
      </div>
 
      {activeTab === "simulation" && (
        <>
 
          <div className="sim-row">
 
            {/* INPUT PANEL */}
 
            <aside className="card inputs-panel">
 
              <h3 className="panel-heading">Inputs</h3>
 
              <div className="how-to-start">
                <b>How to start:</b> pick a case file below →
                click Start Trace → follow the 4 steps shown in
                the canvas.
              </div>
 
              <label className="field-label">
                Step A — Select E-mail Case File
              </label>
 
              <select
                className="column-select"
                value={selectedCaseId}
                disabled={simulationStarted}
                onChange={(e) =>
                  setSelectedCaseId(e.target.value)
                }
              >
                <option value="">— Select a case file —</option>
 
                {SAMPLES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {completedCaseIds.includes(item.id)
                      ? `✓ ${item.label}`
                      : item.label}
                  </option>
                ))}
              </select>
 
              <span className="hint-text">
                Six case files are available; trace any five. A ✓
                means that case is already recorded.
              </span>
 
              <label className="field-label shift-label">
                Subject of Selected Mail
              </label>
 
              <textarea
                className="text-input subject-preview"
                value={
                  SAMPLES.find(
                    (item) => item.id === selectedCaseId
                  )?.subject || ""
                }
                placeholder="Select a case file to preview its subject"
                readOnly
                rows={3}
              />
 
              <div className="action-buttons">
 
                {!simulationStarted && (
                  <button
                    className="btn-verify full-width"
                    onClick={handleStartTrace}
                  >
                    🔍 Step B — Start Trace
                  </button>
                )}
 
                <button
                  className="btn-reset full-width"
                  onClick={handleReset}
                >
                  ↺ Reset
                </button>
 
              </div>
 
              <div className="input-note">
 
                <span>ℹ</span>
 
                <p>
                  Every step in the canvas shows WHAT to type and
                  WHERE to read it from. Nothing has to be
                  calculated — only read and copy carefully.
                </p>
 
              </div>
 
            </aside>
 
            {/* CANVAS */}
 
            <div className="card canvas-panel">
 
              <h3 className="panel-heading">Simulation Canvas</h3>
 
              <div className="canvas-area">
 
                {!simulationStarted || !sample ? (
                  <DefaultPreview />
                ) : (
                  <ManualCanvasSimulation
 
                    sample={sample}
                    phase={phase}
 
                    ipInput={ipInput}
                    ipStatus={ipStatus}
                    ipLocked={ipLocked}
 
                    headerValues={headerValues}
                    headerStatus={headerStatus}
                    headerLocked={headerLocked}
 
                    geoValues={geoValues}
                    geoStatus={geoStatus}
                    geoLocked={geoLocked}
 
                    verdictChoice={verdictChoice}
                    verdictStatus={verdictStatus}
                    verdictLocked={verdictLocked}
 
                    feedback={feedback}
 
                    onIpChange={(value) => setIpInput(value)}
 
                    onHeaderChange={(key, value) =>
                      setHeaderValues((prev) => ({
                        ...prev,
                        [key]: value,
                      }))
                    }
 
                    onGeoChange={(key, value) =>
                      setGeoValues((prev) => ({
                        ...prev,
                        [key]: value,
                      }))
                    }
 
                    onVerdictChange={(value) =>
                      setVerdictChoice(value)
                    }
 
                    onCheckIp={handleCheckIp}
                    onCheckHeader={handleCheckHeader}
                    onCheckGeo={handleCheckGeo}
                    onCheckVerdict={handleCheckVerdict}
 
                    onContinue={handleContinue}
                    onNewTrace={handleNewTrace}
                    onTryAgain={handleTryAgain}
 
                  />
                )}
 
              </div>
 
            </div>
 
            {/* ANALYSIS */}
 
            <aside className="card analysis-panel">
 
              <h3 className="panel-heading orange">
                Live Analysis
              </h3>
 
              <div className="analysis-block">
 
                <h4 className="analysis-sub">Current Trace</h4>
 
                <table className="analysis-table">
 
                  <tbody>
 
                    <tr>
                      <td>Status</td>
                      <td>:</td>
                      <td>
                        {!simulationStarted
                          ? "Waiting to start"
                          : phase === 4
                          ? "Completed"
                          : `Step ${phase + 1} of 4`}
                      </td>
                    </tr>
 
                    <tr>
                      <td>Case</td>
                      <td>:</td>
                      <td>{sample ? sample.id : "—"}</td>
                    </tr>
 
                    <tr>
                      <td>Subject</td>
                      <td>:</td>
                      <td>{sample ? sample.subject : "—"}</td>
                    </tr>
 
                    <tr>
                      <td>Hops</td>
                      <td>:</td>
                      <td>{sample ? sample.hops : "—"}</td>
                    </tr>
 
                    <tr>
                      <td>Origin IP</td>
                      <td>:</td>
                      <td>
                        {ipLocked && sample
                          ? sample.originIP
                          : "—"}
                      </td>
                    </tr>
 
                    <tr>
                      <td>Location</td>
                      <td>:</td>
                      <td>
                        {geoLocked && sample
                          ? `${sample.city}, ${sample.country}`
                          : "—"}
                      </td>
                    </tr>
 
                  </tbody>
 
                </table>
 
              </div>
 
              <div className="analysis-block">
 
                <h4 className="analysis-sub">How It Works</h4>
 
                <ol className="how-it-works">
                  <li>Read Received chain bottom-up.</li>
                  <li>Extract origin IP.</li>
                  <li>Verify SPF / DKIM alignment.</li>
                  <li>Geolocate and conclude.</li>
                </ol>
 
              </div>
 
              {verdictLocked && sample && (
                <div className="analysis-block">
 
                  <h4 className="analysis-sub">Verdict</h4>
 
                  <p className="conclusion-text">
                    {sample.verdict}
                  </p>
 
                </div>
              )}
 
            </aside>
 
          </div>
 
          {/* OBSERVATION TABLE */}
 
          <section className="card table-section">
 
            <h3 className="panel-heading orange">
              Observation Table
            </h3>
 
            <div className="table-scroll">
 
              <table className="obs-table">
 
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Case</th>
                    <th>Subject</th>
                    <th>Origin IP</th>
                    <th>Location</th>
                    <th>ISP / ASN</th>
                    <th>Verdict</th>
                    <th>Status</th>
                  </tr>
                </thead>
 
                <tbody>
 
                  {observations.length === 0 ? (
 
                    <tr>
                      <td colSpan="8">No e-mail traced yet.</td>
                    </tr>
 
                  ) : (
 
                    observations.map((row, index) => (
 
                      <tr
                        key={row.timestamp || index}
                        className="row-correct"
                      >
                        <td>{index + 1}</td>
                        <td>{row.caseId}</td>
                        <td>{row.subject}</td>
                        <td>{row.originIP}</td>
                        <td>{row.location}</td>
                        <td>{row.isp}</td>
                        <td>{row.verdict}</td>
                        <td>✔ {row.status}</td>
                      </tr>
 
                    ))
 
                  )}
 
                </tbody>
 
              </table>
 
            </div>
 
            <div className="submit-status sim-status">
 
              <p>
                Successful Traces:
                <b> {Math.min(successfulAttempts, 5)}/5</b>
 
                <br />
 
                {successfulAttempts < 5
                  ? `Complete ${
                      5 - successfulAttempts
                    } more full trace(s) to unlock the Assignment tab.`
                  : "✔ Simulation completed."}
              </p>
 
            </div>
 
          </section>
 
        </>
      )}
 
      {activeTab === "assignment" && (
        <AssignmentScreen
          answers={answers}
          setAnswers={setAnswers}
        />
      )}
 
      <section className="submit-section">
 
        <button
          className={`btn-submit ${
            !submitted ? "enabled" : "disabled"
          }`}
          disabled={submitted}
          onClick={handleSubmit}
        >
          {submitted ? "Submitted" : "Submit Experiment"}
        </button>
 
        <div className="submit-status">
 
          {submitted ? (
 
            <p className="submit-success">
              Experiment Submitted Successfully
            </p>
 
          ) : (
 
            <p>
              Simulation:{" "}
              <b>{Math.min(successfulAttempts, 5)}/5</b>
              {"  |  "}
              Assignment:{" "}
              <b>
                {allAssignmentAnswered ? "Ready" : "Pending"}
              </b>
            </p>
 
          )}
 
        </div>
 
      </section>
 
      {/* MESSAGE POPUP */}
 
      <MessagePopup popup={popup} onClose={() => setPopup(null)} />
 
      {/* HELP POPUP */}
 
      {helpOpen && (
        <div
          className="popup-overlay"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="popup-box help-popup"
            onClick={(e) => e.stopPropagation()}
          >
 
            <h3 className="section-heading orange">
              How to perform this experiment
            </h3>
 
            <p>
              <b>1.</b> Select a case file and click Start Trace.
            </p>
 
            <p>
              <b>2.</b> Step 1 — the header is shown with hop
              badges. Copy the IP inside [ ] of the block marked
              HOP 1 · oldest.
            </p>
 
            <p>
              <b>3.</b> Step 2 — copy the From address,
              Return-Path address and the spf= / dkim= values from
              the highlighted lines.
            </p>
 
            <p>
              <b>4.</b> Step 3 — the database row of your traced
              IP is highlighted in yellow; copy its four values.
            </p>
 
            <p>
              <b>5.</b> Step 4 — SPF/DKIM fail + unrelated
              Return-Path domain means Spoofed; both pass with the
              same domain (or its sub-domain) means Genuine.
            </p>
 
            <button
              className="btn-verify full-width"
              onClick={() => setHelpOpen(false)}
            >
              Got it
            </button>
 
          </div>
        </div>
      )}
 
    </div>
  );
}