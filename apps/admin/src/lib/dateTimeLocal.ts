const DISPLAY_TIMEZONE = "America/Sao_Paulo";

function padDateTimePart(value: number) {
    return String(value).padStart(2, "0");
}

export function formatDateTimeLocalValue(value?: Date | string | null) {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: DISPLAY_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const partMap = new Map(parts.map((part) => [part.type, part.value]));
    const year = partMap.get("year");
    const month = partMap.get("month");
    const day = partMap.get("day");
    const hour = partMap.get("hour");
    const minute = partMap.get("minute");

    if (!year || !month || !day || !hour || !minute) {
        return "";
    }

    return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function parseDateTimeLocalToIso(value?: string | null) {
    if (!value) {
        return null;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    const timezoneOffsetInMinutes = parsedDate.getTimezoneOffset();
    const timezoneHours = Math.floor(Math.abs(timezoneOffsetInMinutes) / 60);
    const timezoneMinutes = Math.abs(timezoneOffsetInMinutes) % 60;

    return `${value}${timezoneOffsetInMinutes <= 0 ? "+" : "-"}${padDateTimePart(timezoneHours)}:${padDateTimePart(timezoneMinutes)}`;
}
