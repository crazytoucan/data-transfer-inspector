import {
  Box,
  Callout,
  Code,
  DataList,
  Heading,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";

type SerializedDataTransferItem =
  | {
      kind: "string";
      type: string;
      stringValue: string;
    }
  | {
      kind: "file";
      type: string;
      fileValue: File | null;
    };

/**
 * DataTransfer handles are only valid through the duration of the drag/paste operation,
 * so they can't be persisted in React state and rendered directly.
 *
 * They also don't implement structuredClone(), which is annoying
 */
type SerializedDataTransfer = {
  items: SerializedDataTransferItem[];
};

async function serializeDataTransfer(
  dt: DataTransfer
): Promise<SerializedDataTransfer> {
  // DataTransfer doesn't implement Iterable, so we array-ify it manually
  const itemsArray = new Array(dt.items.length)
    .fill(0)
    .map((_, i) => dt.items[i]);

  const serializedItems = await Promise.all(
    itemsArray.map(async (item): Promise<SerializedDataTransferItem> => {
      if (item.kind === "string") {
        return {
          kind: "string",
          type: item.type,
          stringValue: await new Promise<string>((resolve) =>
            item.getAsString(resolve)
          ),
        };
      } else if (item.kind === "file") {
        return {
          kind: "file",
          type: item.type,
          fileValue: item.getAsFile(),
        };
      } else {
        throw new Error(`Unexpected item.kind: ${item.kind}`);
      }
    })
  );

  return {
    items: serializedItems,
  };
}

function DataTransferView({ dt }: { dt: SerializedDataTransfer | null }) {
  return (
    <DataList.Root>
      {dt != null &&
        dt.items.map((item, index) => (
          <DataList.Item key={index}>
            <DataList.Label className="mime-label">{item.type}</DataList.Label>
            <DataList.Value>
              <Code>
                {item.kind === "file"
                  ? `<File ${item.fileValue?.name ?? ""}>`
                  : item.stringValue}
              </Code>
            </DataList.Value>
          </DataList.Item>
        ))}
    </DataList.Root>
  );
}

function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  deps: unknown[]
) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => {
      window.removeEventListener(event, handler);
    };
  }, deps);
}

function InputArea() {
  const [isWindowDragging, setIsWindowDragging] = useState(() => false);
  const [isDragEnter, setIsDragEnter] = useState(() => false);

  const [dataTransfer, setDataTransfer] =
    useState<SerializedDataTransfer | null>(() => null);

  useWindowEvent(
    "dragstart",
    () => {
      setIsWindowDragging(true);
    },
    []
  );

  useWindowEvent(
    "dragend",
    () => {
      setIsWindowDragging(false);
    },
    []
  );

  console.log("render", dataTransfer);

  return (
    <>
      <Heading size="2" mb="1">
        Input
      </Heading>
      <TextField.Root
        className={`inputarea ${isWindowDragging ? "-window-dragging " : ""} ${
          isDragEnter ? "-drag-enter" : ""
        }`}
        size="3"
        onPaste={async (evt) => {
          try {
            setDataTransfer(await serializeDataTransfer(evt.clipboardData));
          } catch (e) {
            console.error(e);
          }
        }}
        onDragOver={(evt) => {
          // required to mark this as a compatible drop zone
          evt.preventDefault();
        }}
        onDragEnter={() => {
          setIsDragEnter(true);
        }}
        onDragLeave={() => {
          setIsDragEnter(false);
        }}
        onDrop={async (evt) => {
          evt.preventDefault();
          setIsDragEnter(false);
          try {
            setDataTransfer(await serializeDataTransfer(evt.dataTransfer));
          } catch (e) {
            console.error(e);
          }
        }}
        placeholder="Paste or drop here to inspect clipboard data"
        value=""
        onChange={() => {
          // we don't want to listen to the value; make the React warning go away
        }}
      />
      <Separator size="4" my="4" />
      <DataTransferView dt={dataTransfer} />
    </>
  );
}

export function App() {
  return (
    <Box maxWidth="900px" mx="auto">
      <Box py="4" px="6" my="8">
        <Heading size="6" mb="4">
          DataTransfer Inspector
        </Heading>
        <p>
          A simple tool to inspect the HTML5 DataTransfer{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer">
            [mdn]
          </a>{" "}
          MIME types associated with paste and drag-and-drop events. To use this
          tool, simply paste or drop a payload into the box below. All
          clientside, no network requests ever.
        </p>
        <Callout.Root mb="3">
          <Callout.Icon>💡</Callout.Icon>
          <Callout.Text>
            Not sure why this is interesting? Try <strong>pasting</strong> text
            from VSCode or <strong>dragging</strong> a few songs from a Spotify
            playlist!
          </Callout.Text>
        </Callout.Root>
        <InputArea />
      </Box>
    </Box>
  );
}
