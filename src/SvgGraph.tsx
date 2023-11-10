import DOMPurify from "dompurify";
import {useContext, useRef} from "react";
import {Segment, SegmentsContext, SegmentsContextType} from "./SegmentsContext";

const sanitize = (s: string): string => {
  return DOMPurify.sanitize(s, {USE_PROFILES: {html: false},}).trim();
}

type SvgImgProp = {
  segments: Segment[];
};

const SvgImg = ({segments}: SvgImgProp): JSX.Element => {
  const VIEW_WIDTH = 1000;
  const VIEW_HEIGHT = 1000;
  const OUTER_LINE_RADIUS = 500;
  const OUTER_TEXT_RADIUS = 440; // view is 1000
  const INNER_TEXT_RADIUS = 50; // view is 1000
  const START_ANGLE_OFFSET_RADIANS = (-90 * Math.PI / 180); // rotate -90 degrees
  const STRAIGHT_DOWN_RADIANS = (180 * Math.PI / 180);
  const STRAIGHT_UP_RADIANS = (360 * Math.PI / 180);

  const pngPage1Ref = useRef<HTMLDivElement>(null);

  const getXYForStep = (index: number, radius: number) => {
    const eachStepRadians = (2 * Math.PI) / ((segments.length || 1) * 2); // double since we have lines between text
    const angleRadians = index * eachStepRadians;
    return {
      x: VIEW_WIDTH / 2 + radius * Math.cos(angleRadians + START_ANGLE_OFFSET_RADIANS),
      y: VIEW_HEIGHT / 2 + radius * Math.sin(angleRadians + START_ANGLE_OFFSET_RADIANS),
      angle: angleRadians
    }
  }


  const svgSegments = segments?.map((seg, index) => {
    const outerTextParts = seg.outerText.split("\n");
    const outerTextLine1 = sanitize(outerTextParts[0] || "").trim();
    const outerTextLine2 = sanitize(outerTextParts[1] || "").trim();
    const innerText = sanitize(seg.innerText);
    const {x: xLine, y: yLine} = getXYForStep(index * 2, OUTER_LINE_RADIUS);
    const {x: xOuter, y: yOuter} = getXYForStep(index * 2 + 1, OUTER_TEXT_RADIUS);
    const {x: xInner, y: yInner, angle} = getXYForStep(index * 2 + 1, INNER_TEXT_RADIUS);
    const flipped = (angle < STRAIGHT_DOWN_RADIANS) || (angle > STRAIGHT_UP_RADIANS);
    const color = "black";

    const parts = [`<path d="M ${VIEW_WIDTH / 2},${VIEW_HEIGHT / 2}
             L ${xLine},${yLine}
             z" class="sepLine"></path>
        <text x="${xOuter}" y="${yOuter}" text-anchor="middle" dominant-baseline="middle" fill="${color}">
            ${outerTextLine1}
        </text>`,

      `<path d="M ${VIEW_WIDTH / 2},${VIEW_HEIGHT / 2}
                 L ${xLine},${yLine}
                 z" class="sepLine"></path>
        <text x="${xOuter}" y="${yOuter}" text-anchor="middle" dominant-baseline="middle">
            <tspan x="${xOuter}" dx="1.5em" dy="-1em" text-anchor="middle" fill="${color}">${outerTextLine1}</tspan>
            <tspan x="${xOuter}" dx="1em" dy="1em" text-anchor="middle" fill="${color}">${outerTextLine2}</tspan>
        </text>`, `
        <path id="path-${index}" fill="none" stroke="none" d="M ${xInner},${yInner} L ${xOuter},${yOuter} z"></path>
        <text><textPath href="#path-${index}"
        startOffset="${INNER_TEXT_RADIUS}"
              text-anchor="start" dominant-baseline="middle"
              fill="${color}" font-size="14px"
        >${innerText}</textPath></text>
        `, // this is for the right side where text is flipped
      `
        <path id="pathflipped-${index}" fill="none" stroke="none" d="M ${xOuter},${yOuter} L ${xInner},${yInner} z"></path>
        <text><textPath href="#pathflipped-${index}"
        startOffset="${OUTER_LINE_RADIUS - INNER_TEXT_RADIUS - 100}"
              text-anchor="end" dominant-baseline="middle"
              fill="${color}" font-size="14px"
        >${innerText}</textPath></text>`];

    return `<g> ${outerTextLine2.length ? parts[1] : parts[0]} ${flipped ? parts[2] : parts[3]}</g>`;
  });

  // generate the svg
  const svg1 = `<svg x="0" y="0" width="100%" viewBox="0 0 1000 1000"
xmlns="http://www.w3.org/2000/svg"
style="display: block">
<defs>
<style type="text/css"><![CDATA[
text { white-space: pre; }
path, image { pointer-events: none; }
.sepLine{
fill: none;
stroke: #000;
stroke-width: 1.527;
stroke-miterlimit: 10;
}
]]></style>
</defs>
${svgSegments}
</svg>
`;

  const urlData = encodeURIComponent(svg1);
  return <>
    <div
        ref={pngPage1Ref}
        className={"svg-scale"}
        key={"page1FormSVG"}
        dangerouslySetInnerHTML={{
          __html: svg1, // all elements inserted into svg MUST be DOMPurify.sanitize
        }}
    />
    <a download="mmm_pie.svg"
       className={"usa-button save-image-button"}
       target="_blank"
       rel="noreferrer"
       href={`data:image/svg+xml;charset=utf-8,${urlData}`}> 🖼 <span
        className={"expand-text"}>Save image...</span></a><br/>
  </>
};

export const SvgGraph = () => {
  const {segments} = useContext(SegmentsContext) as SegmentsContextType;
  return (<SvgImg segments={segments}/>);
};
