const IdRenderer = function (competitionId) {

    this.competitionId = competitionId;
    this.generator = null;
    this.wcif = null;
    this.competitionData = null;
    this.renderIds = function () {
        Promise.all([fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${this.competitionId}/wcif/public`)
            .then(r => r.json()), fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${this.competitionId}`)
            .then(r => r.json())])
            .then(res => {
                this.wcif = res[0];
                this.competitionData = res[1];
                let container = document.querySelector(".container");
                this.generator = new PersonalScheduleGenerator(this.wcif);
                for (let i = 0; i < this.wcif.persons.length; i++) {
                    container.innerHTML = container.innerHTML + this.createCard(this.wcif.persons[i]);
                }
            })
    }

    this.createCard = competitor => {
        const lang = competitor.countryIso2 === 'PL' ? 'pl' : 'en';

        //roles
        let roles = ['competitor_' + competitor.gender.toLowerCase()];
        roles.push(...competitor.roles);
        const rolesTexts = roles.map(function (role) {
            return i18n[lang].roles[role];
        });

        return `<div class="id-card">
            <div class="logo-bg">
                <div style="text-align: center; padding-top: 5px"><img src="logo1.png" class="logo"></div>
                <h1 style="font-size: 24px; text-align: center; font-family: apex; margin: 0 0 10px 0">${this.wcif.name}</h1>
                <div style="display: flex; align-items: center; justify-content: space-around; padding: 5px 0">
                    <div><p class="name" style="font-size: 28px; margin: 5px 0; text-align: center">${competitor.name}</p></div>
                </div>
                <div><p style="text-align: center; font-size: 20px" ">${rolesTexts.join(' / ')}</p></div>
                <h3 style="font-weight: 800; font-size: 12px; text-align: center; margin-bottom: 0">${i18n[lang].events.label}</h3>
                <div class="events">
                    ${competitor.registration.eventIds.map(id => `<span class="cubing-icon event-${id}"></span>`).join(' ')}
                </div>
                <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-evenly; margin-top: 10px">
                    <img src="brizzon.png" class="partner-logo">
                    <img src="halcube.png" class="partner-logo">
                    <img src="speedcube.jpeg" class="partner-logo">
                    <img src="quay.png" class="partner-logo">
                    <img src="pss.png" class="partner-logo">
                    <img src="wca.png" class="partner-logo">
                </div>
                <p style="text-align: center; font-size: 16px; margin: 0">${this.competitionData.city}</p>
                <p style="text-align: center; font-size: 16px; margin: 0; font-weight: 300">${this.renderCompetitionDate()}</p>
            </div>
        </div>
        <div class="id-card">
            <div class="logo-bg">
                <p style="text-align: center; margin: 2px 0">${competitor.name}${ competitor.wcaId ? ', WCA ID: ' + competitor.wcaId : ''}</p>
                ${this.createAssignementsSection(this.generator.getActivitiesForCompetitor(competitor.wcaId), competitor, lang)}
            </div>
        </div>`;
    }

    this.createAssignementsSection = (activities, competitor, lang) => {
        const groupedActivitiesMap = new Map();
        for (let i = 0; i < activities.length; i++) {
            const activityDate = activities[i].activity.startTime.substr(0,10);
            if (groupedActivitiesMap.has(activityDate)) {
                groupedActivitiesMap.get(activityDate).push(activities[i]);
            } else {
                groupedActivitiesMap.set(activityDate, [activities[i]]);
            }
        }
        let html = '';
        groupedActivitiesMap.forEach((activities, date) => {
            html += `<p style="text-align: center; margin: 2px 0">${date}</p>`;
            activities.forEach(activity => {
                const eventCode = activity.activity.activityCode.split('-')[0];
                const start = new Date(activity.activity.startTime).toTimeString().substr(0,5);
                html += `<p style="background: #2e588322;padding: 3px; margin: 1px 0"><span style="margin-right: 5px; font-size: 14px" class="cubing-icon event-${activity.activity.activityCode.split('-')[0]}"></span>${start} ${this.getRoleTranslation(activity.role, competitor, lang)} ${this.getActivityCodeTranslation(activity.activity.activityCode, lang)}</p>`
            })
        })
        html += `<p style="position: absolute; bottom: 5px; left: 0; right: 0; text-align: center; font-size: 8px">${i18n[lang].assignments.notice}</p>`;
        return html;
    }

    this.getRoleTranslation = (role, competitor, lang) => {
        if (role === 'competitor') {
            role += '_' + competitor.gender.toLowerCase();
        }
        return i18n[lang].roles[role];
    }

    this.getActivityCodeTranslation = (code, lang) => {
        const codeSections = code.split('-');
        eventCode = codeSections[0];
        roundCode = codeSections[1];
        groupCode = '';
        attemptCode = '';
        if (codeSections[2][0] === 'g') {
            groupCode = codeSections[2];
        } else if (codeSections[2][0] === 'a') {
            attemptCode = codeSections[2];
        }

        let translation = `${i18n[lang].events[eventCode]}, ${i18n[lang].events.round} ${roundCode.substr(1)}`;
        if (groupCode !== '') translation += `, ${i18n[lang].events.group} ${groupCode.substr(1)}`;
        if (attemptCode !== '') translation += `, ${i18n[lang].events.attempt} ${attemptCode.substr(1)}`;
        return translation;
    }

    this.renderCompetitionDate = () => {
        const startDate = new Date(this.competitionData.start_date);
        const endDate = new Date(this.competitionData.end_date);
        if (startDate.getTime() === endDate.getTime()) {
            return `${startDate.getDate()}.${startDate.getMonth()}.${startDate.getFullYear()}`;
        } else if (startDate.getMonth() === startDate.getMonth()) {
            return `${startDate.getDate()} - ${endDate.getDate()}.${startDate.getMonth()}.${startDate.getFullYear()}`;
        } else if (startDate.getFullYear() === endDate.getFullYear()) {
            return `${startDate.getDate()}.${startDate.getMonth()}. - ${endDate.getDate()}.${endDate.getMonth()}.${startDate.getFullYear()}`;
        } else {
            return `${startDate.getDate()}.${startDate.getMonth()}.${startDate.getFullYear()} - ${endDate.getDate()}.${endDate.getMonth()}.${endDate.getFullYear()}`;
        }
    }
}