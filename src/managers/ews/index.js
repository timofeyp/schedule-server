const EWS = require('node-ews');
const log = require('src/utils/log')(module);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const ewsConfig = {
  username: 'asp-pts',
  password: 'defender',
  host: 'https://10.3.6.11',
};

const ews = new EWS(ewsConfig);

const ewsFunction = 'CreateItem';

const ewsArgs = {
  attributes: {
    SendMeetingInvitations: 'SendToAllAndSaveCopy',
  },
  SavedItemFolderId: {
    DistinguishedFolderId: {
      attributes: {
        Id: 'calendar',
      },
    },
  },
  Items: {
    CalendarItem: {
      Subject: 'Event',
      Body: {
        attributes: {
          BodyType: 'Text',
        },
        $value: 'This is a test email',
      },
      ReminderIsSet: true,
      ReminderMinutesBeforeStart: 60,
      Start: '2020-02-26T14:00:00',
      End: '2020-02-26T16:00:00',
      IsAllDayEvent: false,
      LegacyFreeBusyStatus: 'Busy',
      Location: 319,
      RequiredAttendees: {
        Attendee: {
          Mailbox: {
            EmailAddress: 'timofeyp@live.com',
          },
        },
      },
    },
  },
};

const ewsSoapHeader = {
  't:RequestServerVersion': {
    attributes: {
      Version: 'Exchange2010',
    },
  },
};

const createCalendarItem = async () => {
  try {
    const result = await ews.run(ewsFunction, ewsArgs, ewsSoapHeader);
    log.info(result);
  } catch (e) {
    log.error(e);
  }
};

module.exports = createCalendarItem;
