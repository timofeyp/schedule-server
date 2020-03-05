const EWS = require('node-ews');
const log = require('src/utils/log')(module);
const crypt = require('src/utils/crypt');
const config = require('config');
const { User } = require('src/db');
const moment = require('moment');
const {
  EWS: { host },
} = config;
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const ewsFunction = 'CreateItem';

const getEwsArgs = (event, user) => {
  const { dateTimeStart, dateTimeEnd, localRoom, eventName, ldapParts } = event;
  const { name: userFullName } = user;
  const RequiredAttendees = ldapParts.map(EmailAddress => ({
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
        Start: moment(dateTimeStart).toISOString(),
        End: moment(dateTimeEnd).toISOString(),
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

const getConfig = ({ ntHashedPassword, lmHashedPassword, mail }) => {
  const hashedPass = crypt.decryptPass(ntHashedPassword, lmHashedPassword);
  return {
    username: mail,
    host,
    ...hashedPass,
  };
};

module.exports = async event => {
  const options = {
    strictSSL: false,
  };
  const eventOwner = await User.findOne({ _id: event.ownerUserId });
  const ewsConfig = getConfig(eventOwner);
  const EWSSession = new EWS(ewsConfig, options);
  try {
    const ewsArgs = getEwsArgs(event, eventOwner);
    const result = await EWSSession.run(ewsFunction, ewsArgs, ewsSoapHeader);
    log.info({ result, userMail: eventOwner.mail });
  } catch (e) {
    log.error(e);
  }
};
