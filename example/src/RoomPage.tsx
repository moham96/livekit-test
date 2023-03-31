import { useCallback, useEffect } from 'react';
import { useRoom } from '@livekit/react-components';
import { ConnectionState, setLogLevel, RoomEvent } from 'livekit-client';
const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwNjgwMjYyMzQ4LCJpc3MiOiJkZXZrZXkiLCJuYW1lIjoidXNlcjEiLCJuYmYiOjE2ODAyNjIzNDgsInN1YiI6InVzZXIxIiwidmlkZW8iOnsicm9vbSI6IlN0dWRlbnRzIiwicm9vbUFkbWluIjp0cnVlLCJyb29tSm9pbiI6dHJ1ZX19.us1Yn1hFJM9TUfjkfJ4F2ts1g1CZJJWSD7eDsbKYh7o';
export function RoomPage() {
  const roomState = useRoom();

  useEffect(() => {
    console.log({ roomState });
    setLogLevel('debug');
    roomState
      .connect('ws://localhost:7880', token)
      .then((room) => {
        console.log('connecting', room);
        if (!room) {
          console.log(new Error('RoomPage room is not ready yet'));
          return;
        }
        room.once(RoomEvent.Disconnected, () => {
          console.log('disconnected');
        });

        if (room.state === ConnectionState.Connected) {
          console.log('connected successfully');
        }
      })
      .catch((reason) =>
        console.log('failed', { reason: reason, 'roomState.error': roomState.error }),
      );

    return () => {
      if (roomState.room?.state !== ConnectionState.Disconnected) {
        roomState.room?.disconnect();
      }
    };
  }, []);
  const updateMetadata = useCallback((identity: string, metadata: string) => {
    return fetch('http://localhost:7880/twirp/livekit.RoomService/UpdateParticipant', {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        room: 'Students',
        identity: identity,
        metadata: metadata,
        name: '',
      }),
      method: 'POST',
    });
  }, []);
  return (
    <div className="flex flex-col">
      <div className="w-full flex flex-row justify-center mb-4">
        <button
          className=" border-solid border-2 w-10 bg-red-500"
          onClick={() => {
            roomState.participants.forEach(async (participant) => {
              updateMetadata(
                participant.identity,
                String.fromCharCode(0 | (Math.random() * 26 + 97)),
              );
            });
          }}
        >
          Test
        </button>
      </div>
      <div className="grid gap-2 grid-cols-2">
        {roomState.participants.map((participant) => {
          return (
            <div key={participant.sid} className=" bg-orange-400 p-2">
              <div>Name: {participant.identity}</div>
              <div>Metadata: {participant.metadata}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoomPage;
