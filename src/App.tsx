import {
  Box,
  Code,
  DataList,
  Heading,
  Separator,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";

function DataTransferItemValue({ item }: { item: DataTransferItem }) {
  const [value, setValue] = useState<string | File | null>(() => "");
  useEffect(() => {
    setValue("");
    let canceled = false;
    if (item.kind === "string") {
      item.getAsString((stringValue) => {
        if (!canceled) {
          setValue(stringValue);
        }
      });
    } else {
      setValue(item.getAsFile());
    }

    return () => {
      canceled = true;
    };
  }, [item]);

  return value instanceof File ? `<File ${value.name}>` : value;
}

function itemsToArray(dataTransfer: DataTransfer) {
  return new Array(dataTransfer.items.length)
    .fill(0)
    .map((_, idx) => dataTransfer.items[idx]);
}

function DataTransferView({ dt }: { dt: DataTransfer | null }) {
  return (
    <DataList.Root>
      {dt != null &&
        itemsToArray(dt).map((item, index) => (
          <DataList.Item key={index}>
            <DataList.Label className="mime-label">{item.type}</DataList.Label>
            <DataList.Value>
              <Code>
                <DataTransferItemValue item={item} />
              </Code>
            </DataList.Value>
          </DataList.Item>
        ))}
    </DataList.Root>
  );
}

function InputArea() {
  const [dataTransfer, setDataTransfer] = useState<DataTransfer | null>(
    () => null
  );

  return (
    <>
      <Heading size="2" mb="1">
        Input
      </Heading>
      <TextField.Root
        size="3"
        onPaste={(evt) => {
          setDataTransfer(evt.clipboardData);
        }}
        placeholder="Paste or drag here to inspect clipboard data"
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
        <InputArea />
      </Box>
    </Box>
  );
}
