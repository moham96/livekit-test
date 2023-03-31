import { faDesktop, faStop } from '@fortawesome/free-solid-svg-icons';
import { Room } from 'livekit-client';
import React, { ReactElement } from 'react';
import { useParticipant } from '@livekit/react-core';
import { AudioSelectButton } from './AudioSelectButton';
import { ControlButton } from './ControlButton';
import styles from './styles.module.css';
import { VideoSelectButton } from './VideoSelectButton';
export interface ControlsProps {
  room: Room;
  enableScreenShare?: boolean;
  enableAudio?: boolean;
  enableVideo?: boolean;
  onLeave?: (room: Room) => void;
}

export const ControlsView = ({
  room,
  enableScreenShare,
  enableAudio,
  enableVideo,
  onLeave,
}: ControlsProps) => {
  const { cameraPublication: camPub, microphonePublication: micPub } = useParticipant(
    room.localParticipant,
  );

  if (enableScreenShare === undefined) {
    enableScreenShare = true;
  }
  if (enableVideo === undefined) {
    enableVideo = true;
  }
  if (enableAudio === undefined) {
    enableAudio = true;
  }

  const [audioButtonDisabled, setAudioButtonDisabled] = React.useState(false);
  let muteButton: ReactElement | undefined;
  if (enableAudio) {
    const enabled = !(micPub?.isMuted ?? true);
    muteButton = (
      <AudioSelectButton
        isMuted={!enabled}
        isButtonDisabled={audioButtonDisabled}
        onClick={async () => {
          setAudioButtonDisabled(true);
          room.localParticipant
            .setMicrophoneEnabled(!enabled)
            .finally(() => setAudioButtonDisabled(false));
        }}
        onSourceSelected={(device) => {
          setAudioButtonDisabled(true);
          room
            .switchActiveDevice('audioinput', device.deviceId)
            .finally(() => setAudioButtonDisabled(false));
        }}
      />
    );
  }

  const [videoButtonDisabled, setVideoButtonDisabled] = React.useState(false);

  let videoButton: ReactElement | undefined;
  if (enableVideo) {
    const enabled = !(camPub?.isMuted ?? true);
    videoButton = (
      <VideoSelectButton
        isEnabled={enabled}
        isButtonDisabled={videoButtonDisabled}
        onClick={() => {
          setVideoButtonDisabled(true);
          room.localParticipant
            .setCameraEnabled(!enabled)
            .finally(() => setVideoButtonDisabled(false));
        }}
        onSourceSelected={(device) => {
          setVideoButtonDisabled(true);
          room
            .switchActiveDevice('videoinput', device.deviceId)
            .finally(() => setVideoButtonDisabled(false));
        }}
      />
    );
  }

  const [screenButtonDisabled, setScreenButtonDisabled] = React.useState(false);
  let screenButton: ReactElement | undefined;
  if (enableScreenShare) {
    const enabled = room.localParticipant.isScreenShareEnabled;
    screenButton = (
      <ControlButton
        label={enabled ? 'Stop sharing' : 'Share screen'}
        icon={enabled ? faStop : faDesktop}
        disabled={screenButtonDisabled}
        onClick={() => {
          setScreenButtonDisabled(true);
          room.localParticipant
            .setScreenShareEnabled(!enabled)
            .finally(() => setScreenButtonDisabled(false));
        }}
      />
    );
  }

  return (
    <div className={styles.controlsWrapper}>
      <button
        onClick={() => {
          room.participants.forEach(async (participant) => {
            const participantInfo = fetch(
              'http://localhost:7880/twirp/livekit.RoomService/UpdateParticipant',
              {
                headers: {
                  accept: 'application/json, text/plain, */*',
                  authorization:
                    'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tQWRtaW4iOnRydWUsInJvb20iOiJTdHVkZW50cyJ9LCJpYXQiOjE2ODAxMjEyMDQsIm5iZiI6MTY4MDEyMTIwNCwiZXhwIjoxNjgwMTIxODA0LCJpc3MiOiJkZXZrZXkifQ.HZMiLnIjn3sEdjqGGvzT4dUrwwvk-RaOu6rYngObfOk',
                  'content-type': 'application/json',
                },
                referrerPolicy: 'strict-origin-when-cross-origin',
                body: JSON.stringify({
                  room: 'Students',
                  identity: participant.identity,
                  metadata: JSON.stringify({
                    group: { title: 'A', color: 'red' },
                  }),
                  name: '',
                }),
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
              },
            );
            console.log({ participantInfo: participantInfo });
          });
        }}
      >
        Send Test
      </button>
      {muteButton}
      {videoButton}
      {screenButton}
      {onLeave && (
        <ControlButton
          label="End"
          className={styles.dangerButton}
          onClick={() => {
            room.disconnect();
            onLeave(room);
          }}
        />
      )}
    </div>
  );
};
