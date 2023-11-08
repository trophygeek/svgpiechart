import {Button, Fieldset, Textarea, TextInput} from "@trussworks/react-uswds";
import {Segment, SegmentsContext, SegmentsContextType} from "./SegmentsContext";
import {ChangeEvent, Dispatch, useContext, useState} from "react";
import {Reorder} from "framer-motion"

/**
 * The prop drilling is stupid but it prevents the refresh focus bug when typing in the edit fields.
 */
type SegmentFieldsProps = {
  index: number,
  segments: Segment[];
  updateSegment: (index: number, segment: Segment) => void;
  setSegments: Dispatch<React.SetStateAction<Segment[]>>;
  currentEditKey: string;
  setCurrentEditKey: Dispatch<React.SetStateAction<string>>;
};

const SegmentFields = ({
                         index, segments, updateSegment, setSegments, currentEditKey, setCurrentEditKey
                       }: SegmentFieldsProps): React.ReactElement => {
  const key = segments[index].key;
  const [currentValue] = useState(segments[index]);

  const onChangeOuter = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    if (segments[index]) {
      const data = {
        key: segments[index].key, outerText: event?.currentTarget?.value || "", innerText: segments[index].innerText
      };
      updateSegment(index, data);
    }
  };
  const onChangeInner = (event: ChangeEvent<HTMLInputElement>): void => {
    if (segments[index]) {
      const data = {
        key: segments[index].key, innerText: event?.currentTarget?.value || "", outerText: segments[index].outerText
      };
      updateSegment(index, data);
    }
    event.preventDefault();
  };
  const deleteSegment = (key: string) => {
    const updated = segments.filter(each => each.key !== key);
    setSegments(updated);
  }

  const startEditSegment = (key: string) => {
    setCurrentEditKey(key);
  }

  const endEditSegment = (key: string) => {
    setCurrentEditKey("");
  }

  return (<Fieldset key={`segment${key}`} className={"usa-fieldset drag-indicator"}>
    {key === currentEditKey ?
        <Button type={"button"} className={"save-button"} accentStyle={"cool"} aria-label={"save item"}
                data-key={key}
                onClick={(event) => {
                  const key = event.currentTarget.dataset["key"];
                  if (key?.length) {
                    endEditSegment(key);
                  }
                }}> ✓ </Button> :
        <Button type={"button"} className={"edit-button"} accentStyle={"cool"} aria-label={"edit item"}
                data-key={key}
                onClick={(event) => {
                  const key = event.currentTarget.dataset["key"];
                  if (key?.length) {
                    startEditSegment(key);
                    setTimeout(() => {
                      const textElem = document.getElementById(`outer${key}`) as HTMLTextAreaElement;
                      textElem?.focus();
                      textElem?.select();
                    }, 0);
                  }
                }}> ✎ </Button>}
    <Button type={"button"} className={"delete-button"} accentStyle={"warm"} aria-label={"delete item"}
            data-key={key}
            onClick={(event) => {
              const key = event.currentTarget.dataset["key"];
              if (key?.length) {
                deleteSegment(key);
              }
            }}> 🗑</Button>
    <Textarea id={`outer${key}`} name={`outer${key}`} key={`outer${key}`} rows={2}
              onChange={(e) => onChangeOuter(e)}
              defaultValue={currentValue.outerText || ""}
              disabled={key !== currentEditKey}
    ></Textarea>
    <TextInput id={`inner${key}`} name={`inner${key}`} key={`inner${key}`} type={"text"}
               onChange={(e) => onChangeInner(e)}
               defaultValue={currentValue.innerText || ""}
               disabled={key !== currentEditKey}></TextInput>
  </Fieldset>);
};


const SortableList = () => {
  const {segments, setSegments, updateSegment} = useContext(SegmentsContext) as SegmentsContextType;
  const [currentEditKey, setCurrentEditKey] = useState("");

  // dragListener={false}
  // tie into if we're in edit mode on an item or not.
  return (<Reorder.Group values={segments} onReorder={setSegments}>
    {segments.map((item, index) => (<Reorder.Item key={`reorder-${item.key}`}
                                                  value={item}
                                                  dragListener={currentEditKey !== item.key}
                                                  className={currentEditKey !== item.key ? "drag-enabled" : "drag-disabled"}
    >
      <SegmentFields key={`fields-${item.key}`} index={index}
                     segments={segments}
                     updateSegment={updateSegment}
                     setSegments={setSegments}
                     currentEditKey={currentEditKey}
                     setCurrentEditKey={setCurrentEditKey}
      />
    </Reorder.Item>))}
  </Reorder.Group>);
};

export const SegmentsEditForm = (): React.ReactElement => {
  return <>
    <form key={"mainform"}>
      <div className={"scrollable"}>
        <SortableList/>
      </div>
    </form>
  </>;
}
