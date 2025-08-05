import {v4 as uuidv4} from "uuid";

export function getOrCreateSessionId() {
    const EXPIRATION_MS = 1000 * 60 * 60
    const stored = JSON.parse(localStorage.getItem("sessionsInfo") || "{}");
    const now = Date.now()

    const isExpired = !stored.timestamp || now - stored.timestamp > EXPIRATION_MS;

    if (!stored.id || isExpired) {
        const newId = uuidv4()
        const sessionInfo = {id: newId, timestamp: now};
        localStorage.setItem("sessionsInfo", JSON.stringify(sessionInfo))
        return newId;
    }

    return stored.id;
}