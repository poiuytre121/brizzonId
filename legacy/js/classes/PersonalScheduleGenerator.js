const PersonalScheduleGenerator = function (wcif) {
    let activities = new Map();
    wcif.schedule.venues.forEach(function (venue) {
        venue.rooms.forEach(function (room) {
            room.activities.forEach(function (activity) {
                activities.set(activity.id, activity);
                activities.set(activity.activityCode, activity);
                activity.childActivities.forEach(function (child) {
                    activities.set(child.id, child);
                    activities.set(child.activityCode, child);
                })
            });
        });
    });

    this.activities = activities;
    this.wcif = wcif;
    this.getActivitiesForCompetitor = (id) => {
        let person = this.wcif.persons.filter(person => person.wcaUserId === id)[0];
        return person.assignments.map(assignment => {
            return {
                role: assignment.assignmentCode, activity: this.activities.get(assignment.activityId)
            }
        }).sort((a, b) => a.activity.startTime.localeCompare(b.activity.startTime));
    }
}