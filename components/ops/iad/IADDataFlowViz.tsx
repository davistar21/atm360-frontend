"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { User, Server, Box } from "lucide-react"; // Ops Admin, Bank Core, Gateway (Box as gateway)
import { motion } from "framer-motion";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
}

export default function IADDataFlowViz() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = svg.node()?.parentElement;
    if (!container) return;

    const drawChart = () => {
      svg.selectAll("*").remove(); // Clear previous

      const { width: containerWidth } = container.getBoundingClientRect();
      const width = containerWidth;
      const height = 300;

      svg.attr("viewBox", `0 0 ${width} ${height}`);

      // Define nodes with responsive spacing
      const nodes: Node[] = [
        {
          id: "admin",
          label: "Operations Admin",
          x: width * 0.15,
          y: height / 2,
        },
        { id: "iad", label: "IAD Gateway", x: width * 0.5, y: height / 2 },
        {
          id: "bank",
          label: "Bank Core / Switch",
          x: width * 0.85,
          y: height / 2,
        },
      ];

      // Define links
      const links: Link[] = [
        { source: "admin", target: "iad" },
        { source: "iad", target: "bank" },
        { source: "bank", target: "iad" },
        { source: "iad", target: "admin" },
      ];

      // Arrow markers
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "var(--color-zenith-neutral-600)");

      // Draw links
      svg
        .append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("x1", (d) => nodes.find((n) => n.id === d.source)!.x)
        .attr("y1", (d) => nodes.find((n) => n.id === d.source)!.y)
        .attr("x2", (d) => nodes.find((n) => n.id === d.target)!.x)
        .attr("y2", (d) => nodes.find((n) => n.id === d.target)!.y)
        .attr("stroke", "var(--color-zenith-neutral-400)")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      // Tooltip setup
      const tooltip = d3
        .select(container)
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "white")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0);

      // Draw nodes group
      const nodeGroup = svg
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Define icon size
      const iconSize = 48;

      // Render customized nodes with icons and label
      nodeGroup.each(function (d) {
        //@ts-expect-error type
        const group = d3.select(this);

        if (d.id === "iad") {
          // IAD Gateway node - small squarish gateway with pulse effect outside SVG
          // Instead of drawing circle here, just prepare container to overlay react motion icon
          group
            .append("rect")
            .attr("x", -20)
            .attr("y", -20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("fill", "var(--color-zenith-accent-200)")
            .attr("stroke", "var(--color-zenith-accent-600)")
            .attr("stroke-width", 2);
        } else {
          // Circle background for admin and bank
          group
            .append("circle")
            .attr("r", 35)
            .attr(
              "fill",
              d.id === "admin"
                ? "var(--color-zenith-accent-100)"
                : "var(--color-zenith-success)"
            )
            .attr("stroke", "var(--color-zenith-neutral-600)")
            .attr("stroke-width", 2);
        }
      });

      // Append icons with React, using svgRef container
      // Remove old react-enhanced icons before adding
      d3.select("#svg-icons").remove();

      // Container for React-patched icons
      const iconsContainer = d3
        .select(container)
        .append("div")
        .attr("id", "svg-icons")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("fontSize", `${iconSize}px`)
        .style("fontWeight", "bold")
        // align icons vertically centered relative to svg nodes
        .style(
          "top",
          `${
            container.getBoundingClientRect().top + height / 2 - iconSize / 2
          }px`
        );

      // Get container offset for positioning
      const containerRect = container.getBoundingClientRect();

      // Function to create icon divs positioned absolutely
      const createIconDiv = (
        id: string,
        leftPx: number,
        IconComp: React.FC<any>,
        pulse = false
      ) => {
        const div = iconsContainer
          .append("div")
          .style("position", "absolute")
          .style("left", `${leftPx}px`)
          .style("width", `${iconSize}px`)
          .style("height", `${iconSize}px`)
          .style("display", "flex")
          .style("justify-content", "center")
          .style("align-items", "center")
          .node();

        // React render the icon with framer motion if pulse
        import("react-dom").then((ReactDOM) => {
          import("react").then((React) => {
            const iconJsx = pulse ? (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: "relative",
                  width: iconSize,
                  height: iconSize,
                }}
              >
                <IconComp
                  color="var(--color-zenith-accent-600)"
                  size={iconSize}
                />
                <motion.div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "8px",
                    border: "3px solid var(--color-zenith-accent-200)",
                    opacity: 0.6,
                    boxSizing: "border-box",
                  }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              <IconComp
                color="var(--color-zenith-neutral-700)"
                size={iconSize}
              />
            );
            ReactDOM.render(iconJsx, div);
          });
        });
      };

      // Left: Operations Admin - User icon
      createIconDiv(
        "admin-icon",
        nodes[0].x - iconSize / 2 - containerRect.left,
        User
      );

      // Center: IAD Gateway - Box icon pulsing
      createIconDiv(
        "iad-icon",
        nodes[1].x - iconSize / 2 - containerRect.left,
        Box,
        true
      );

      // Right: Bank Core / Switch - Server icon
      createIconDiv(
        "bank-icon",
        nodes[2].x - iconSize / 2 - containerRect.left,
        Server
      );

      // Labels below nodes via SVG <text>
      nodeGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", 50)
        .attr("font-size", 12)
        .attr("fill", "var(--color-zenith-neutral-700)")
        .text((d) => d.label);

      // Animate packets along links (small circles moving along the link lines to show flow)
      const packetGroup = svg.append("g");

      const animatePackets = () => {
        const packets = packetGroup
          .selectAll("circle")
          .data(links)
          .join("circle")
          .attr("r", 5)
          .attr("fill", (d) => {
            if (d.source === "admin") return "var(--color-zenith-accent-600)";
            if (d.source === "iad") return "var(--color-zenith-accent-300)";
            return "var(--color-zenith-success)";
          });

        packets.each(function (d, i) {
          const source = nodes.find((n) => n.id === d.source)!;
          const target = nodes.find((n) => n.id === d.target)!;

          const packet = d3.select(this);
          const pathLength = Math.hypot(
            target.x - source.x,
            target.y - source.y
          );
          const duration = 3000 + i * 400;

          const repeat = () => {
            packet
              .attr("cx", source.x)
              .attr("cy", source.y)
              .transition()
              .duration(duration)
              .ease(d3.easeLinear)
              .attr("cx", target.x)
              .attr("cy", target.y)
              .on("end", repeat);
          };

          repeat();
        });
      };

      animatePackets();
    };

    drawChart();
    window.addEventListener("resize", drawChart);

    return () => {
      window.removeEventListener("resize", drawChart);
      d3.select(container).selectAll("div").remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      exit={{ opacity: 0, x: -80 }}
      style={{ backgroundColor: "var(--color-zenith-neutral-50)" }}
      className="p-4 rounded shadow relative"
    >
      {/* <h4
        style={{ color: "var(--color-zenith-neutral-900)" }}
        className="font-semibold mb-3"
      >
        Data Flow (Operations Admin ↔ IAD Gateway ↔ Bank Core / Switch)
      </h4> */}
      <svg ref={svgRef} width="100%" height="300px" />
      <div
        style={{ color: "var(--color-zenith-neutral-500)" }}
        className="mt-4 text-xs"
      >
        Notes: Secure mTLS channels between IAD Gateway and Bank; audited sync
        logs kept for CBN; NIBSS checks during verification.
      </div>
    </motion.div>
  );
}
