const svgObject = document.getElementById("blueprintSVG");

const animateBlueprint = () => {
    const svgDoc = svgObject.contentDocument;
    if (!svgDoc) {
        console.warn("SVG contentDocument not available yet.");
        return;
    }

    const paths = svgDoc.querySelectorAll("path");
    console.log("Paths found:", paths.length);
    if (!paths.length) return;

    svgObject.style.visibility = "visible";
    svgObject.style.opacity = "0.5";

    paths.forEach((path, index) => {
        const length = path.getTotalLength();

        path.style.fill = "none";
        path.style.stroke = "#66d9ff";
        path.style.strokeWidth = "2";
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        setTimeout(() => {
            path.style.transition = "stroke-dashoffset 0.8s ease";
            path.style.strokeDashoffset = "0";
        }, index * 10);
    });
};

if (svgObject) {
    svgObject.addEventListener("load", animateBlueprint);

    if (svgObject.contentDocument && svgObject.contentDocument.readyState === "complete") {
        animateBlueprint();
    }
} else {
    console.warn("Could not find #blueprintSVG object element.");
}
