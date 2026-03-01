# A2UI (Agent-to-User Interface) Protocol

A2UI is a JSONL-based, streaming UI protocol designed to enable Large Language Models (LLMs) to generate and stream structured, interactive user interfaces to any client in real-time.

---

## 🚀 What is this project?

A2UI (Agent-to-UI) is a specification and a set of libraries that bridge the gap between AI Agents and User Interfaces. Instead of an LLM simply outputting text or complex, deeply nested JSON, A2UI allows the agent to stream a **flat, adjacency-list-based UI definition**. 

The protocol is designed to be:
- **LLM-Friendly**: Easy for generative models to produce reliably.
- **Progressive**: Renders instantly as data arrives, improving perceived performance.
- **Platform-Agnostic**: One server implementation can drive Web, Mobile, and Desktop clients.

---

## 🎯 What is it built for?

Traditional UI development for AI often suffers from "The Latency Problem" (waiting for the whole response) and "The Formatting Problem" (LLMs struggling with rigid tree structures). A2UI solves these by:

1.  **Enabling Generative UIs**: Allowing AI to decide exactly what UI components are needed based on the user's intent.
2.  **Fast Time-to-Interaction**: By streaming JSONL over SSE, the client can show the first `Card` or `Header` while the LLM is still "thinking" about the rest of the layout.
3.  **Cross-Platform Consistency**: Use the same logical UI components (`Row`, `Button`, `TextField`) regardless of whether the user is on a browser or a mobile app.
4.  **Flexible State Management**: Decoupling the UI structure from the dynamic data so that only data changes need to be sent after the initial render.

---

## 🏗️ How is it built?

A2UI is built on a modular architecture consisting of three main parts:

### 1. The Protocol (The "Wire")
- **JSON Lines (JSONL)**: Each message is a single-line JSON object.
- **Streaming over SSE**: Typically delivered via Server-Sent Events for real-time updates.
- **Adjacency List Model**: Instead of a nested tree, components are sent as a flat list with IDs, making it trivial for an LLM to generate them sequentially.

### 2. The Agent Side (The "Brain")
- **Python ADK**: A library for building agents that can "speak" A2UI.
- **Java Library**: For integrating A2UI into enterprise Java applications.
- **Schema Management**: Tools that inject UI definitions into LLM prompts so the model knows what it's allowed to build.

### 3. The Renderer Side (The "Eyes")
- **Web (Lit & Angular)**: Native web components that interpret the A2UI stream and render matching HTML/CSS.
- **Mobile (Flutter)**: A renderer that maps A2UI components to Flutter widgets for native mobile performance.

---

## 🛠️ Core Concepts

-   **Surfaces**: Independent UI regions (e.g., a chat bubble, a sidebar, a modal).
-   **Catalogs**: A contract between the agent and client defining which components (e.g., `Image`, `Slider`, `Chart`) are supported.
-   **Data Binding**: Connecting UI components to a dynamic JSON data model using paths (e.g., `/user/profile/name`).
-   **User Actions**: A standardized way for clients to report interactions (clicks, input) back to the agent.

---

## 📈 Use Cases

-   **AI Chatbots with Rich UI**: Go beyond text responses; show interactive maps, booking forms, or data visualizations instantly.
-   **Domain-Specific AI Tools**: Create custom "agents" for travel, finance, or HR that generate specialized UIs on the fly.
-   **Multi-Agent Orchestrators**: A single "Shell" application that can render UIs from many different backend agents seamlessly.

---

## 📂 Repository Structure

-   `specification/`: The formal protocol definitions and JSON schemas.
-   `samples/`: Demo implementations including the "Contact Lookup" and "Restaurant Finder" agents.
-   `renderers/`: Source code for the Lit, Angular, and Flutter rendering libraries.
-   `a2a_agents/`: Helper libraries for building A2UI-compatible agents.
-   `tools/`: Development utilities like the **A2UI Editor** and **Inspector**.

---

For more details, see the [A2UI Protocol Specification](specification/v0_8/docs/a2ui_protocol.md).
