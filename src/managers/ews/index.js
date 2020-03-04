const EWS = require('node-ews');
const log = require('src/utils/log')(module);
const crypt = require('src/utils/crypt');
const config = require('config');
const moment = require('moment');
moment.locale();
const {
  EWS: { host },
} = config;
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const ewsFunction = 'CreateItem';

const getEwsArgs = req => {
  const {
    dateTimeStart,
    dateTimeEnd,
    localRoom,
    eventName,
    ldapUsers,
  } = req.body;
  const { name: userFullName } = req.user;
  const RequiredAttendees = ldapUsers.map(EmailAddress => ({
    Attendee: {
      Mailbox: {
        EmailAddress,
      },
    },
  }));
  const Location = localRoom || 'не указана';
  const dateText = moment(dateTimeStart).format('DD-MM-YYYY HH:mm');
  return {
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
        Subject: eventName,
        Body: {
          attributes: {
            BodyType: 'HTML',
          },
          $value: `${userFullName.bold()} приглашает вас принять участие в мероприятии: ${eventName.bold()}. Аудитория: ${Location.bold()}. Время: ${dateText.bold()}`,
        },
        ReminderIsSet: true,
        ReminderMinutesBeforeStart: 60,
        Start: dateTimeStart,
        End: dateTimeEnd,
        IsAllDayEvent: false,
        LegacyFreeBusyStatus: 'Busy',
        Location,
        RequiredAttendees,
      },
    },
  };
};

const ewsSoapHeader = {
  't:RequestServerVersion': {
    attributes: {
      Version: 'Exchange2010',
    },
  },
  't:TimeZoneContext': {
    't:TimeZoneDefinition': {
      attributes: {
        Id: 'Russian Standard Time',
      },
    },
  },
};

const getConfig = user => {
  const { ntHashedPassword, lmHashedPassword, mail } = user;
  const hashedPass = crypt.decryptPass(ntHashedPassword, lmHashedPassword);
  return {
    username: mail,
    host,
    ...hashedPass,
  };
};

module.exports = async req => {
  const options = {
    strictSSL: false,
  };
  const ewsConfig = getConfig(req.user);
  const EWSSession = new EWS(ewsConfig, options);
  try {
    const ewsArgs = getEwsArgs(req);
    const result = await EWSSession.run(ewsFunction, ewsArgs, ewsSoapHeader);
    log.info(result);
  } catch (e) {
    log.error(e);
  }
};
