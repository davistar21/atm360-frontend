"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGuideStore, guideRoutes } from "@/lib/store/guideStore";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function GuideTour() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isActive,
    currentRouteIndex,
    currentStepIndex,
    stopGuide,
    nextStep,
    previousStep,
    getCurrentStep,
    getCurrentRoute,
  } = useGuideStore();

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = getCurrentStep();
  const currentRoute = getCurrentRoute();

  // Navigate to current route if needed
  useEffect(() => {
    if (isActive && currentRoute && pathname !== currentRoute) {
      router.push(currentRoute);
    }
  }, [isActive, currentRoute, pathname, router]);

  // Update target element and position when step changes
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetElement(null);
      setTooltipPosition(null);
      return;
    }

    // Wait for route navigation and DOM update
    const findAndSetElement = () => {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        return true;
      }
      return false;
    };

    const timeout = setTimeout(() => {
      if (!findAndSetElement()) {
        // Try again after a short delay if element not found
        setTimeout(() => {
          findAndSetElement();
        }, 500);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [isActive, currentStep, pathname, currentStepIndex, currentRouteIndex]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition(); // Initial update
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [targetElement]);

  const calculateTooltipStyle = () => {
    if (!tooltipPosition || !currentStep || viewportSize.width === 0) return {};

    const position = currentStep.position || "bottom";
    const spacing = 20;
    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = tooltipPosition.top - spacing;
        left = tooltipPosition.left + tooltipPosition.width / 2;
        return {
          top: `${Math.max(spacing, top)}px`,
          left: `${left}px`,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        top = tooltipPosition.top + tooltipPosition.height + spacing;
        left = tooltipPosition.left + tooltipPosition.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: "translate(-50%, 0)",
        };
      case "left":
        top = tooltipPosition.top + tooltipPosition.height / 2;
        left = tooltipPosition.left - spacing;
        return {
          top: `${top}px`,
          left: `${Math.max(spacing, left)}px`,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        top = tooltipPosition.top + tooltipPosition.height / 2;
        left = tooltipPosition.left + tooltipPosition.width + spacing;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: "translate(0, -50%)",
        };
      case "center":
        top = viewportSize.height / 2;
        left = viewportSize.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: "translate(-50%, -50%)",
        };
      default:
        return {};
    }
  };

  const scrollToElement = (element: HTMLElement) => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  };

  useEffect(() => {
    if (targetElement) {
      scrollToElement(targetElement);
      // Add highlight class

      targetElement.style.transition = "all 0.3s ease";
      targetElement.style.zIndex = "9999";
      targetElement.style.position = "relative";
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = "";
        targetElement.style.position = "";
      }
    };
  }, [targetElement]);

  // Initialize and update viewport size - MUST be before any early returns
  useEffect(() => {
    const updateViewport = () => {
      setViewportSize({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      });
    };
    if (typeof window !== "undefined") {
      updateViewport();
      window.addEventListener("resize", updateViewport);
      return () => window.removeEventListener("resize", updateViewport);
    }
  }, []);

  // Early return AFTER all hooks
  if (!isActive || !currentStep) return null;

  const currentRouteData = guideRoutes[currentRouteIndex];
  if (!currentRouteData) return null; // Safety check

  const totalSteps = guideRoutes.reduce(
    (acc, route) => acc + route.steps.length,
    0
  );
  const currentStepNumber =
    guideRoutes
      .slice(0, currentRouteIndex)
      .reduce((acc, route) => acc + route.steps.length, 0) +
    currentStepIndex +
    1;

  const canGoPrevious = currentStepIndex > 0 || currentRouteIndex > 0;
  const isLastStep =
    currentRouteIndex === guideRoutes.length - 1 &&
    currentStepIndex === currentRouteData.steps.length - 1;

  return (
    <>
      {/* Overlay with hole for target element */}
      {targetElement && tooltipPosition && viewportSize.width > 0 && (
        <>
          {/* Top overlay */}
          {tooltipPosition.top > 0 && (
            <div
              className="fixed left-0 right-0  bg-[rgba(0,0,0,0.6)] z-[9998]"
              style={{
                top: 0,
                height: `${Math.max(0, tooltipPosition.top)}px`,
              }}
            />
          )}
          {/* Bottom overlay */}
          {tooltipPosition.top + tooltipPosition.height <
            viewportSize.height && (
            <div
              className="fixed left-0 right-0  bg-[rgba(0,0,0,0.6)] z-[9998]"
              style={{
                top: `${tooltipPosition.top + tooltipPosition.height}px`,
                height: `${Math.max(
                  0,
                  viewportSize.height -
                    (tooltipPosition.top + tooltipPosition.height)
                )}px`,
              }}
            />
          )}
          {/* Left overlay */}
          {tooltipPosition.left > 0 && (
            <div
              className="fixed  bg-[rgba(0,0,0,0.6)] z-[9998]"
              style={{
                top: `${Math.max(0, tooltipPosition.top)}px`,
                left: 0,
                width: `${Math.max(0, tooltipPosition.left)}px`,
                height: `${tooltipPosition.height}px`,
              }}
            />
          )}
          {/* Right overlay */}
          {tooltipPosition.left + tooltipPosition.width <
            viewportSize.width && (
            <div
              className="fixed  bg-[rgba(0,0,0,0.6)] z-[9998]"
              style={{
                top: `${Math.max(0, tooltipPosition.top)}px`,
                left: `${tooltipPosition.left + tooltipPosition.width}px`,
                width: `${Math.max(
                  0,
                  viewportSize.width -
                    (tooltipPosition.left + tooltipPosition.width)
                )}px`,
                height: `${tooltipPosition.height}px`,
              }}
            />
          )}
        </>
      )}

      {/* Full overlay when no target or calculating */}
      {(!targetElement || !tooltipPosition || viewportSize.width === 0) && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[9998] transition-opacity"
        />
      )}

      {/* Spotlight on target element */}
      {targetElement && tooltipPosition && (
        <div
          className="fixed z-[9999] border-4 border-zenith-accent-500 rounded-lg pointer-events-none shadow-2xl ring-4 ring-zenith-accent-300 ring-opacity-50"
          style={{
            top: `${tooltipPosition.top - 4}px`,
            left: `${tooltipPosition.left - 4}px`,
            width: `${tooltipPosition.width + 8}px`,
            height: `${tooltipPosition.height + 8}px`,
          }}
        />
      )}

      {/* Tooltip */}
      {currentStep && (
        <div
          ref={tooltipRef}
          className="fixed z-[10000] max-w-sm"
          style={calculateTooltipStyle()}
        >
          <Card className="p-6 shadow-2xl border-2 border-zenith-accent-500 bg-white">
            {/* Close button */}
            <button
              onClick={stopGuide}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close guide"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Step indicator */}
            <div className="text-xs font-medium text-blue-600 mb-2">
              Step {currentStepNumber} of {totalSteps}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {currentStep.title}
            </h3>

            {/* Content */}
            <p className="text-sm text-gray-600 mb-4">{currentStep.content}</p>

            {/* Route indicator */}
            <div className="text-xs text-gray-500 mb-4">
              {currentRouteData.route === "/ops" && "Overview"}
              {currentRouteData.route === "/ops/map" && "ATM Map"}
              {currentRouteData.route === "/ops/activity" && "Activity"}
              {currentRouteData.route === "/ops/alerts" && "Alerts"}
              {currentRouteData.route === "/ops/reports" && "Reports"}
              {currentRouteData.route === "/ops/management" && "Management"}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={!canGoPrevious}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <Button
                onClick={isLastStep ? stopGuide : nextStep}
                size="sm"
                className="flex items-center gap-1 bg-zenith-accent-600 text-white hover:bg-zenith-accent-700"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
