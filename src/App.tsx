import React, {ChangeEvent, useEffect, useState} from 'react';
import './App.css';
import {RandomKey, Segment, SegmentsContext} from "./SegmentsContext";
import {SvgGraph} from "./SvgGraph";
import {SegmentsEditForm} from "./SegmentsEditForm";
import {Button, Grid, GridContainer} from "@trussworks/react-uswds";

const DEFAULT_SESSIONS = [{
  key: RandomKey(), outerText: 'outer text 1', innerText: 'inner text 1',
}, {
  key: RandomKey(), outerText: 'outer text 2', innerText: 'inner text 2',
}, {
  key: RandomKey(), outerText: 'outer text 3', innerText: 'inner text 3',
},];

const LOCAL_STORAGE_KEY = "backupSegments";

function App() {
  const [segments, setSegments] = useState<Segment[]>([]);
  useEffect(() => {
    // restore from backup in localStorage if we can
    const dataStr = window.localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
    try {
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.length) {
          setSegments(data);
          return;
        }
      }
    } catch (err) {
      console.log(err);
    }
    setSegments(DEFAULT_SESSIONS);
  }, []);

  useEffect(() => {
    // restore from backup in localStorage if we can
    try {
      if (segments.length) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(segments));
      }
    } catch (err) {
      console.log(err);
    }
  }, [segments]);

  // we REALLY need to have a version field, etc in this data
  const encodedSegmentsForSaveAs = encodeURIComponent(JSON.stringify(segments, null, 2));
  const saveAsLink = `data:text/json;charset=utf-8,${encodedSegmentsForSaveAs}`;

  const restoreFromFile = (event: ChangeEvent<HTMLInputElement>) => {
    // Stop the form from reloading the page
    event.preventDefault();

    // If there's no file, do nothing
    if (!event.target.files?.length) return;

    const file = event.target?.files[0];

    // Create a new FileReader() object
    let reader = new FileReader();

    reader.addEventListener("load", () => {
      // this will then display a text file
      if (typeof reader.result === "string") {
        setSegments(JSON.parse(reader.result));
      }
    }, false,);

    // Read the file
    reader.readAsText(file);
  };

  const addSegment = (newSeg: Segment) => {
    setSegments([...segments, newSeg]);
  }

  const updateSegment = (index: number, seg: Segment) => {
    if (segments && segments[index]) {
      const clone = [...segments];
      clone[index] = {key: segments[index].key, outerText: seg.outerText, innerText: seg.innerText}
      setSegments(clone);
    }
  };

  return (<div className="App">
    <SegmentsContext.Provider value={{segments, setSegments, addSegment, updateSegment}}>
      <main id="main-content" className={"main-content-area"}>
        <GridContainer containerSize="widescreen" className={"vw-100"}>
          <Grid row>
            <Grid desktop={{col: 8}}>
              <>
                <label className={"usa-button"}>
                  <input type="file" onChange={(evt) => restoreFromFile(evt)}/> ⬆ Restore from file...
                </label>
              </>

              <a download="savedSvgthingyData.json"
                 href={saveAsLink} target="_blank" rel="noopener" className={"usa-button"}> 💾 Save data...</a>
            </Grid>
            <Grid desktop={{col: 4}}>
              <Button type={"button"} onClick={() => {
                addSegment({
                             key: RandomKey(),
                             outerText: `new outer ${segments.length + 1}`,
                             innerText: `new inner ${segments.length + 1}`
                           });
              }}> + Add New</Button>
            </Grid>
          </Grid>
          <Grid row>
            <Grid desktop={{col: 8}} className={"svg-container"}>
              <SvgGraph/>
            </Grid>
            <Grid desktop={{col: 4}}>
              <SegmentsEditForm/>
            </Grid>
          </Grid>
        </GridContainer>
        <div className={"usa-footer float-lower-left"}>This is a SERVERLESS site. All data is stored locally in your
          browser.
        </div>
      </main>
    </SegmentsContext.Provider>
  </div>);
}

export default App;
