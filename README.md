# QuickAid — Emergency Navigation App

QuickAid is an emergency navigation tool designed to help international students, newcomers, and residents quickly find the fastest and most appropriate emergency department (A&E) during a medical crisis.

---

## Overview

QuickAid simplifies emergency healthcare by showing users:

- Which hospitals can treat them
- How long they might wait
- Which route gives the fastest total time to be seen

It is built for people who are unfamiliar with the UK healthcare system — especially those confused by NHS, A&E, IHS, or private insurance rules.

---

## Core Features

### AI Emergency Locator

- Shows nearby A&E departments, urgent care centres, and hospitals
- Interactive map with essential info: address, opening hours, service type
- Helps users quickly identify where care is available right now

### Insurance & Access Filter

- Select NHS / IHS (international student surcharge) / private insurance
- QuickAid filters hospitals that accept your coverage
- Prevents unexpected fees and helps newcomers understand their options

### QuickRoute AI (Smart Hospital Ranking)

QuickRoute AI analyses each hospital's real-time situation (expected wait time, crowd level, current patient load) and recommends the hospital that minimises the total time until being seen — not necessarily the geographically nearest.

Example:

- St Thomas’: 15 minutes travel, ~1 hour expected wait
- Lewisham: 55 minutes travel, much shorter wait

QuickAid recommends St Thomas’ because the total time to be seen is shortest.

### Safety Check Gate

On app start QuickAid runs a short safety triage asking about life‑threatening symptoms (chest pain, breathing difficulty, severe bleeding, sudden vision loss, etc.). If the user reports any of these, QuickAid immediately advises calling `999` or going to the nearest A&E.

### Context-Aware Checklist

When a hospital is selected QuickAid generates a concise “what to bring” checklist:

- Passport / ID
- Insurance / IHS proof
- Medication list
- Relevant medical documents
- Emergency contact

This helps users stay organised during stressful emergencies.

### Multilingual Snap-Switch

One-tap language switch for international accessibility.

### After-Visit Guidance

After the emergency visit QuickAid provides practical next steps:

- How to register with a GP
- Where to collect prescriptions
- How to arrange follow-up care

---

## Why QuickAid Matters

International students and newcomers often face:

- Uncertainty about which hospitals accept their insurance / IHS
- Confusion between A&E and urgent care options
- Unpredictable waiting times
- Language barriers
- Lack of clear after-visit guidance

QuickAid makes UK emergency care faster, clearer, and more accessible.

---

## Tech Stack
- Vite + TypeScript
- React
- Tailwind CSS
- Mapbox GL, Recharts, React Hook Form/Zod, and various Radix primitives to cover maps, charts, and form handling.


## Team

- Yuzhen (Max) Yang
- Shian (Andy) Ye
- Sarah Asulaim
- Zhewen (Ryan) Zheng
