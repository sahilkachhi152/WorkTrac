// ===============================
// GET FACTORY DATE
// ===============================

const getFactoryDate = () => {

    const now = new Date();

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    ).format(now);

};


// ===============================
// ADD DAYS TO YYYY-MM-DD
// ===============================

const addDays = (dateString, days) => {

    const date = new Date(
        `${dateString}T00:00:00Z`
    );

    date.setUTCDate(
        date.getUTCDate() + days
    );

    return date
        .toISOString()
        .slice(0, 10);

};


// ===============================
// EXPORTS
// ===============================

module.exports = {
    getFactoryDate,
    addDays
};