import { getErrorMessage } from '~helpers';
import { NOTIFICATION_TYPE_ERROR } from '~constants';

const _versionInfoStorageKey = 'announcement.version';
const _githubReleases = 'https://github.com/temporalio/temporal/releases/tag/v';

const fetchVersionInfo = async http => {
  return await http(`/api/cluster/version-info`);
};

export const getNewVersionAnnouncement = async (http, showNotification) => {
  try {
    const versionInfo = await fetchVersionInfo(http);

    if (!versionInfo || !versionInfo.recommended || !versionInfo.current) {
      return { show: false };
    }

    const { version: versionR } = versionInfo.recommended;
    const { version: versionC } = versionInfo.current;

    if (versionR === versionC) {
      return { show: false };
    }

    const discardedRecord = localStorage.getItem(
      `${_versionInfoStorageKey}:${versionR}`
    );

    if (discardedRecord) {
      return { show: false };
    }

    const { instructions, alerts } = versionInfo;
    let alertMessage = '';
    let severity = '';
    if (alerts && alerts.length > 0) {
      alertMessage = alerts[0].message;
      severity = (alerts[0].severity || '').toLowerCase();
    }

    let message = `🪐 ${versionR} version is available!`;
    if (alertMessage || instructions) {
      message = alertMessage ? `${alertMessage} ` : '' + instructions;
    }

    return {
      show: true,
      message,
      version: versionR,
      link: `${_githubReleases}${versionR}`,
      severity,
    };
  } catch (err) {
    const message = getErrorMessage(err);

    showNotification({ message, type: NOTIFICATION_TYPE_ERROR });

    return { show: false };
  }
};

export const discardVersionAnnouncement = version => {
  localStorage.setItem(`${_versionInfoStorageKey}:${version}`, 'false');
};
