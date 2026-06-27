Project Title: ChronoLog – The Episodic Performance
Dashboard
Overview
Your objective is to build a high-fidelity, fluid, and computationally performant mobile
dashboard called ChronoLog. This app displays an aggressive stream of episodic medical
metrics and events. The core challenge is maintaining a continuous 60/120 FPS render
cycle while handling massive telemetry datasets, intricate gesture-driven interactions, and
platform-specific native security layers.
● Time Allocation: 24 Hours
● Target Platforms: iOS and Android (Physical device testing is highly recommended)
Core Functional Requirements
1. The Telemetry Feed (Performance & Data Architecture)
You must render a continuous vertical stream of "Medical Episode Cards" based on the
provided mock data schema below.
● Virtualized Performance: The feed must handle thousands of items smoothly. Rapid
scrolling must not introduce white flashes, blank areas etc.
● Dynamic Heights: Cards contain varied components (some have text notes, some
have data visualizations, some have alert badges). Heights are dynamic and
unpredictable.
● Optimization: You must demonstrate clear architectural prevention of unnecessary
re-renders. Every card component must update independently only when its specific
data mutated.
2. Fluid Micro-Interactions (Aesthetics & UX)
Aesthetics are as critical as raw speed. Avoid basic step-animations.
● The Expandable Details Transition: Tapping an Episode Card must smoothly
expand it into a full-screen detailed view (e.g., the header/card boundary scales
seamlessly into the full screen background).
● The Gesture-Driven Diagnostics Panel: Inside the detailed view, there must be a
slide-up "Diagnostics Sheet". This panel must respond directly to the velocity and
position of the user's thumb gesture (must support dragging, flicking to dismiss, and
rubber-banding at bounds).
● Thread Isolation: All animations, transitions, and gesture handling must execute
purely on the Native UI Thread.

None
3. The Native Layer Gateway (Platform Nuance)
To evaluate your mastery of the boundary between React Native and the operating system,
you are prohibited from using pre-built third-party wrappers for device integrity.
● Custom Native Module: Write a custom Native Module in Swift (iOS) and Kotlin
(Android).
● The Task: The module must programmatically check if the host device is running in
an insecure environment (Jailbroken on iOS / Rooted or Emulator on Android).
● Bridge Execution: Expose this check to the JavaScript layer. If the device fails the
native check, display a highly polished, platform-appropriate system modal or
warning overlay before allowing interaction with the data.
Provided Mock Data Contract
Do not spend time building a backend. Hardcode or bundle this payload structure locally into
an array of 2,000+ items to simulate a heavy production environment. Below are a few
samples of schema, please generate more items to provide variety
JSON

[
{
"id": "ep-101-crit",
"eventType": "VITALS_STREAM",
"timestamp": "2026-06-25T08:30:00Z",
"patientName": "Patient Alpha",
"severity": "CRITICAL",
"metrics": {
"heartRate": [72, 75, 82, 110, 145, 130, 95, 140, 155],
"spo2": 88,
"respiratoryRate": 24
},
"hasNotes": true,
"summaryText": "Acute tachycardic episode recorded during
active observation. Desaturation noted. Immediate intervention
required."
},
{
"id": "ep-102-rout",
"eventType": "VITALS_STREAM",
"timestamp": "2026-06-25T08:15:00Z",
"patientName": "Patient Beta",

"severity": "ROUTINE",
"metrics": {
"heartRate": [68, 70, 69, 72, 71],
"spo2": 98,
"respiratoryRate": 14
},
"hasNotes": false,
"summaryText": null
},
{
"id": "ep-103-audio",
"eventType": "CLINICAL_NOTE",
"timestamp": "2026-06-25T07:45:00Z",
"patientName": "Patient Gamma",
"severity": "INFO",
"metrics": null,
"media": {
"type": "VOICE_MEMO",
"durationSeconds": 142,
"transcriptPreview": "Patient reports mild discomfort in
the lower left quadrant..."
},
"hasNotes": true,
"summaryText": "Audio dictated by Dr. S. Rao during morning
rounds."
},
{
"id": "ep-104-sys",
"eventType": "SYSTEM_ALERT",
"timestamp": "2026-06-25T07:10:00Z",
"patientName": "Bed 4 - Telemetry Hub",
"severity": "WARNING",
"metrics": null,
"systemPayload": {
"errorCode": "ERR_BT_DISCONNECT",
"deviceType": "WEARABLE_MONITOR",
"batteryLevel": 12
},
"hasNotes": false,

"summaryText": "Wearable sensor connectivity lost. Battery
critical."
},
{
"id": "ep-105-null",
"eventType": "VITALS_STREAM",
"timestamp": "2026-06-25T06:30:00Z",
"patientName": "Patient Delta",
"severity": "ELEVATED",
"metrics": {
"heartRate": [90, 92, null, null, 88, 85],
"spo2": null,
"respiratoryRate": 18
},
"hasNotes": true,
"summaryText": "Sensor artifact detected. Partial data loss
during movement."
}
]

Note for Render Requirements: * CRITICAL cards must render an inline sparkline graph
mapping the heartRate array using native canvas or lightweight SVG paths, along with a
pulsing indicator light.
● ROUTINE cards omit the sparkline graph and show only summary metrics, resulting
in a significantly different layout footprint.
Submission Guidelines
1. Repository: Provide a private or public GitHub repository link containing all code.
2. Documentation (README.md): Include a concise document describing:
○ Architectural decisions made regarding performance bottlenecks.
○ How you solved the custom native bridge requirement for both Android and
iOS.
○ Instructions to compile and build the codebase locally.
3. Proof of Performance: Provide a short screen recording (or GIFs) demonstrating
the running app on a simulated or physical device with the React Native Performance
Monitor overlay active, demonstrating sustained frame rates during rapid list
interaction.
4. Please upload an apk along with the code on github

P.S. A Note on Creativity & Product Mindset
While this assignment is governed by strict technical constraints, it is absolutely not a
paint-by-numbers exercise. We have intentionally left the exact visual design of the
dashboard open-ended.
You have the freedom to inject your own aesthetic sensibilities, unique micro-interactions,
and product intuition into this build. If you have a clever idea for how to visualize the null
data gaps in the sparkline, a unique take on the medical audio player, or an unexpectedly
delightful haptic interaction—build it. We are evaluating you as a product engineer, which
means we want to see your unique footprint on the final user experience, not just the
underlying math.
Don't just make it fast; make it beautiful. Surprise us.