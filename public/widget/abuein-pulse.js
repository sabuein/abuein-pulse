"use strict";

/*

Main possible future improvements:

1. extract repeated DOM selectors into a helper if the widget grows
2. make init() resilient if called after a completed submission and you want reset behavior
3. consider exposing window.AbuEinPulse = AbuEinPulse if you want non-module use later

*/

const DEFAULT_CONFIG = {
    widgetName: "AbuEin Pulse v1.0",
    endpoint: "/api/feedback",
    attributionEndpoint: "/api/track-attribution",
    pageQuestion: "Was this page helpful?",
    successMessage: "Thanks for your feedback!",
    errorMessage: "We could not send your feedback right now.",
    skippedMessage: "Feedback not sent in local/static preview.",
    pendingMessage: "Sending feedback...",
    skipTelemetryInLocalPreview: false,
    localHosts: ["127.0.0.1", "localhost"],
    debug: false,
    useBeaconFallback: false,
};

function parseBoolean(value, fallback = false) {
    if (value == null || value === "") return fallback;
    return String(value).toLowerCase() === "true";
}

function readConfigFromDataset(root) {
    const { dataset } = root;

    return {
        endpoint: dataset.endpoint || DEFAULT_CONFIG.endpoint,
        attributionEndpoint: dataset.attributionEndpoint || DEFAULT_CONFIG.attributionEndpoint,
        debug: parseBoolean(dataset.debug, DEFAULT_CONFIG.debug),
        skipTelemetryInLocalPreview: parseBoolean(
            dataset.skipTelemetryInLocalPreview,
            DEFAULT_CONFIG.skipTelemetryInLocalPreview
        ),
    };
}

const AbuEinPulse = {
    config: { ...DEFAULT_CONFIG },
    isSubmitting: false,
    hasSubmitted: false,
    isBound: false,

    init(userConfig = {}) {
        this.root = document.getElementById("abuein-pulse");

        if (!this.root) {
            console.warn(`${this.config.widgetName}: root element not found.`);
            return;
        }

        const datasetConfig = readConfigFromDataset(this.root);
        this.config = { ...DEFAULT_CONFIG, ...datasetConfig, ...userConfig };

        this.question = document.getElementById("pulse-question");
        this.buttons = document.getElementById("pulse-buttons");
        this.yesButton = document.getElementById("pulse-yes");
        this.noButton = document.getElementById("pulse-no");
        this.pending = document.getElementById("pulse-pending");
        this.thanks = document.getElementById("pulse-thanks");
        this.error = document.getElementById("pulse-error");
        this.skipped = document.getElementById("pulse-skipped");
        this.poweredByLink = document.getElementById("pulse-powered-by");

        this.applyConfigToUi();

        if (!this.isBound) {
            this.bindEvents();
            this.isBound = true;
        }

        this.showState("idle");

        if (this.shouldSkipTelemetry()) {
            this.disableLocalTrackingFeatures();
        } else if (this.poweredByLink && this.config.attributionEndpoint) {
            this.poweredByLink.setAttribute("ping", this.config.attributionEndpoint);
        }
    },

    applyConfigToUi() {
        if (this.question) this.question.textContent = this.config.pageQuestion;
        if (this.pending) this.pending.textContent = this.config.pendingMessage;
        if (this.thanks) this.thanks.textContent = this.config.successMessage;
        if (this.error) this.error.textContent = this.config.errorMessage;
        if (this.skipped) this.skipped.textContent = this.config.skippedMessage;
    },

    bindEvents() {
        if (this.yesButton) {
            this.yesButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.submit("yes");
            });
        }

        if (this.noButton) {
            this.noButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.submit("no");
            });
        }

        const parentForm = this.root ? this.root.closest("form") : null;
        if (parentForm) {
            parentForm.addEventListener("submit", (event) => {
                event.preventDefault();
            });
        }
    },

    isLocalPreview() {
        return this.config.localHosts.includes(location.hostname) || location.protocol === "file:";
    },

    shouldSkipTelemetry() {
        return this.config.skipTelemetryInLocalPreview && this.isLocalPreview();
    },

    disableLocalTrackingFeatures() {
        if (this.poweredByLink) {
            this.poweredByLink.removeAttribute("ping");
        }

        if (this.config.debug) {
            console.info(`${this.config.widgetName}: skipping telemetry in local/static preview.`);
        }
    },

    setButtonsDisabled(disabled) {
        if (this.yesButton) this.yesButton.disabled = disabled;
        if (this.noButton) this.noButton.disabled = disabled;
    },

    showState(state) {
        const isIdle = state === "idle";

        if (this.question) this.question.style.display = isIdle ? "block" : "none";
        if (this.buttons) this.buttons.style.display = isIdle ? "flex" : "none";
        if (this.pending) this.pending.style.display = state === "pending" ? "block" : "none";
        if (this.thanks) this.thanks.style.display = state === "success" ? "block" : "none";
        if (this.error) this.error.style.display = state === "error" ? "block" : "none";
        if (this.skipped) this.skipped.style.display = state === "skipped" ? "block" : "none";
    },

    buildPayload(response) {
        return {
            response,
            helpful: response === "yes",
            page: window.location.pathname,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            widget: this.config.widgetName,
        };
    },

    async sendWithFetch(json) {
        const response = await fetch(this.config.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: json,
            keepalive: true,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return true;
    },

    sendWithBeacon(json) {
        if (!navigator.sendBeacon) {
            return false;
        }

        const blob = new Blob([json], { type: "application/json" });
        return navigator.sendBeacon(this.config.endpoint, blob);
    },

    async submit(response) {
        if (this.isSubmitting || this.hasSubmitted) {
            return;
        }

        this.isSubmitting = true;
        this.setButtonsDisabled(true);
        this.showState("pending");

        if (this.config.debug) {
            console.log("hostname:", location.hostname);
            console.log("protocol:", location.protocol);
            console.log("shouldSkipTelemetry:", this.shouldSkipTelemetry());
        }

        const payload = this.buildPayload(response);
        const json = JSON.stringify(payload);

        if (this.shouldSkipTelemetry()) {
            this.hasSubmitted = true;
            this.isSubmitting = false;
            this.showState("skipped");
            return;
        }

        try {
            await this.sendWithFetch(json);
            this.hasSubmitted = true;
            this.showState("success");
        } catch (fetchError) {
            if (this.config.debug) {
                if (this.config.useBeaconFallback) {
                    console.warn(
                        `${this.config.widgetName}: fetch failed, attempting beacon fallback.`,
                        fetchError
                    );
                } else {
                    console.warn(
                        `${this.config.widgetName}: fetch failed and beacon fallback is disabled.`,
                        fetchError
                    );
                }
            }

            if (this.config.useBeaconFallback) {
                const beaconQueued = this.sendWithBeacon(json);
                if (beaconQueued) {
                    this.hasSubmitted = true;
                    this.showState("success");
                    return;
                }
            }

            if (this.config.debug) {
                console.error(`${this.config.widgetName}: feedback submission failed.`, fetchError);
            }

            this.setButtonsDisabled(false);
            this.showState("error");
        } finally {
            this.isSubmitting = false;
        }
    },
};

AbuEinPulse.init();

export default AbuEinPulse;
