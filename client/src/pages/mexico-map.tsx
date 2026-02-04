import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Search, X } from "lucide-react";
import { Link } from "wouter";
import type { Center } from "@shared/schema";

const mexicanStates: Record<string, { name: string; path: string }> = {
  "AGS": { name: "Aguascalientes", path: "M207.5,283.1l-1.4-2.7l-4.1-0.7l-1.4,2l-2.7,0l-0.7-4.1l4.8-4.1l2.7,0.7l2.7,2l2,2.7l0,2.7L207.5,283.1z" },
  "BC": { name: "Baja California", path: "M51.8,56.4l2-4.1l-0.7-8.8l-6.1-10.8l-8.1-8.8l-4.1-1.4l-2,2l0.7,8.1l-4.8,2l-4.8,4.8l-2,8.8l0.7,12.2l4.8,16.9l1.4,10.2l5.4,18.2l2,14.2l4.8,8.1l0.7,6.1l6.8,12.9l4.1-2l1.4-6.8l-2-8.1l4.8-4.1l0-4.1l-4.8-9.5l-1.4-8.8l4.8-3.4l1.4-7.4l-1.4-10.2l0-11.5l4.1-6.1l-1.4-6.1L51.8,56.4z" },
  "BCS": { name: "Baja California Sur", path: "M68.7,156.1l-5.4-2l-2.7,0l-4.8,6.8l0,8.1l-4.8,9.5l0,4.1l4.1,8.8l-2.7,4.8l-0.7,8.8l2,6.8l-4.1,6.1l-1.4,12.2l2.7,8.1l0,6.1l4.1,8.8l8.1,4.8l8.8,0l4.8-2.7l0-10.2l-4.8-12.2l4.1-20.3l4.8-4.8l-1.4-10.8l-1.4-10.8l-4.1-8.1l-1.4-8.1L68.7,156.1z" },
  "CAM": { name: "Campeche", path: "M421.1,380.3l-3.4,4.8l2,4.8l-8.8,6.1l-2,4.8l-4.1,0l-6.8,8.8l-8.1,4.1l0,6.8l-5.4,6.1l-1.4,6.8l6.1,2.7l17.6,0l0-12.2l3.4-15.6l8.8-3.4l12.9,0l0.7-5.4l-6.1-4.1L421.1,380.3z" },
  "CHP": { name: "Chiapas", path: "M371.2,446.9l-2.7-4.8l-6.8-1.4l-6.1,2l-6.8-2l-4.8,4.8l-0.7,6.8l-8.8,11.5l-1.4,6.1l8.1,0l8.8-2l9.5,4.8l4.8,8.8l4.1,1.4l2.7-2.7l0-6.1l4.8-1.4l1.4-6.1l6.8-2.7l1.4-5.4l-4.1-4.8l0-4.1L371.2,446.9z" },
  "CHH": { name: "Chihuahua", path: "M137.3,73.3l-4.1,2l-8.8-2.7l-4.8,3.4l-6.8,0l-3.4,2l-4.1-0.7l-4.8,4.8l-8.8,2.7l-2.7,4.8l-5.4,0.7l-2.7,10.2l0.7,8.1l4.8,4.8l-0.7,4.8l-4.1,1.4l0,6.8l4.8,3.4l6.8,0l1.4,6.1l4.1,1.4l1.4,4.1l10.8,6.8l2.7,6.1l8.8,4.8l2.7,6.8l4.1,2.7l0.7,4.1l8.1,9.5l8.1-0.7l8.8,2l8.8-0.7l4.8-4.8l10.8-1.4l6.1-7.4l0-6.8l-4.1-6.1l0.7-8.8l-2.7-5.4l2.7-7.4l-4.8-4.1l1.4-9.5l-2.7-12.2l2-10.2l-2.7-4.8l0-6.1l-6.8-2.7l-2.7-4.8l-6.1,0.7l-4.1-4.1l-4.8,0l-6.8-6.8L137.3,73.3z" },
  "CDMX": { name: "Ciudad de México", path: "M258.2,347.3l-4.1,0.7l-2,4.1l1.4,4.1l4.1,2l4.8-2.7l1.4-4.1l-2-2.7L258.2,347.3z" },
  "COA": { name: "Coahuila", path: "M201.4,112.3l-8.8-1.4l-10.2,1.4l-2,8.8l2,6.8l-3.4,6.1l-2.7,14.9l-6.8,6.8l-1.4,12.2l4.8,4.1l-2.7,7.4l2.7,5.4l-0.7,8.8l4.1,6.1l0,6.8l4.8,4.8l16.2,0l6.8-4.8l6.1,0.7l6.1-4.1l0-4.1l8.8-3.4l4.8-8.1l6.1,0l1.4-4.8l-2.7-4.1l4.1-6.8l-4.1-11.5l-8.8-0.7l-1.4-6.1l-6.8-2l-4.8-6.8l1.4-4.8l-4.8-5.4l0.7-8.8l-4.8-2.7l-1.4-8.8L201.4,112.3z" },
  "COL": { name: "Colima", path: "M161.7,367.4l-4.8,0l-2.7,4.1l-4.8,0.7l-1.4,4.8l3.4,4.8l4.8,2l4.1-2l2.7-6.1l0.7-4.8L161.7,367.4z" },
  "DUR": { name: "Durango", path: "M130.5,181.8l-6.8,0.7l-6.1,8.1l-4.1-0.7l-8.1,4.8l-4.1,0l-4.8,5.4l0,4.1l6.8,10.2l1.4,10.8l-2.7,8.1l2,8.8l0,8.1l8.1,4.8l6.1,1.4l8.1,8.8l8.8-3.4l6.8,0l1.4-6.1l8.8-0.7l1.4-6.1l6.8-5.4l-0.7-8.1l8.1-4.8l0-4.1l-8.1-9.5l-0.7-4.1l-4.1-2.7l-2.7-6.8l-8.8-4.8l-2.7-6.1l-10.8-6.8L130.5,181.8z" },
  "GTO": { name: "Guanajuato", path: "M217.7,293.9l-4.1-2l-14.2,4.8l-1.4,4.1l2.7,5.4l-2.7,6.8l4.8,4.8l6.8-4.1l4.8,0l1.4-4.8l10.8-1.4l1.4-4.8l-2.7-4.1L217.7,293.9z" },
  "GRO": { name: "Guerrero", path: "M244.7,367.4l-10.2,2l-10.8,9.5l-6.1,1.4l-7.4,10.8l-2,8.1l4.8,4.8l10.2-2l4.8,2.7l14.9-2.7l14.2-8.8l1.4-5.4l4.8-2l4.8,2l1.4-4.1l-4.8-4.8l-4.8,0l-4.8-5.4l-6.1,0L244.7,367.4z" },
  "HID": { name: "Hidalgo", path: "M269.7,305.4l-6.8,2.7l-1.4,4.8l-6.8,1.4l-1.4,6.1l5.4,2.7l-1.4,4.8l4.8,2.7l10.8-6.1l1.4-6.1l8.1-1.4l0.7-4.8l-4.8-1.4L269.7,305.4z" },
  "JAL": { name: "Jalisco", path: "M161.7,261.4l-6.8,4.1l-8.1,0l-6.1,8.8l-1.4,14.2l4.8,8.8l-2.7,6.1l2.7,4.8l-1.4,10.8l-5.4,6.8l5.4,8.1l4.1,0.7l1.4,4.8l4.8,0l2.7-4.1l4.8,0l4.8-4.8l12.9,2l1.4-5.4l-8.8-8.8l-2-10.8l2-6.8l-4.1-2.7l0-4.8l4.8-7.4l1.4-8.1l-5.4-2.7L161.7,261.4z" },
  "MEX": { name: "Estado de México", path: "M244,328.8l-4.8,1.4l-6.1,8.8l-1.4,6.8l5.4,8.8l8.8,1.4l4.1-0.7l2-4.1l4.1-0.7l-1.4-4.1l2-4.1l-1.4-4.8l-4.1-1.4l0-4.1L244,328.8z" },
  "MIC": { name: "Michoacán", path: "M219.1,332.2l-8.8,1.4l-10.8,8.1l-8.8-2l-4.1,8.8l-8.8,8.8l-4.8,0l-1.4,4.8l4.1,6.8l8.8,2l10.2-2l10.8,9.5l10.2-2l5.4-8.8l-5.4-8.8l1.4-6.8l6.1-8.8l4.8-1.4l-4.8-4.8L219.1,332.2z" },
  "MOR": { name: "Morelos", path: "M258.2,359.4l-4.8,1.4l-2,4.8l2.7,4.8l8.8,0l2.7-4.1l0-4.1L258.2,359.4z" },
  "NAY": { name: "Nayarit", path: "M134.6,250.6l-8.1-2.7l-6.1,4.1l-2.7,6.8l-8.8,2.7l-4.1,6.8l4.8,8.1l8.8,4.1l6.1-8.8l8.1,0l6.8-4.1l0.7-5.4l-2-6.1L134.6,250.6z" },
  "NL": { name: "Nuevo León", path: "M257.5,158l-3.4-11.5l-10.8,4.8l-16.2-2l-8.8,0.7l-4.8,2.7l1.4,8.8l4.8,2.7l-0.7,8.8l4.8,5.4l-1.4,4.8l4.8,6.8l6.8,2l1.4,6.1l8.8,0.7l4.1,11.5l4.1,0.7l1.4-6.1l6.8-6.8l-4.8-12.9l1.4-8.1l-2.7-6.8L257.5,158z" },
  "OAX": { name: "Oaxaca", path: "M325.1,395.7l-7.4,0.7l-8.8,6.8l-14.9,0l-7.4-5.4l-1.4,4.1l-4.8-2l-4.8,2l-1.4,5.4l-14.2,8.8l2,5.4l-4.1,4.8l2.7,4.8l-4.8,6.1l8.8,4.8l6.8-0.7l8.8,6.1l10.8-8.1l4.8,0l1.4-6.1l8.8-11.5l0.7-6.8l4.8-4.8l6.8,2l6.1-2l5.4,1.4l2.7-6.8L325.1,395.7z" },
  "PUE": { name: "Puebla", path: "M284.6,322.9l-4.1,1.4l-1.4,4.1l-5.4,2.7l-4.8,6.1l4.1,1.4l1.4,4.8l-2,4.1l1.4,4.1l4.8,1.4l1.4,6.1l4.8-2l7.4,5.4l14.9,0l4.1-4.8l-0.7-10.8l-4.8-2l-1.4-6.8l-4.8-6.1l6.8-4.8l-1.4-4.1l-8.8,2L284.6,322.9z" },
  "QRO": { name: "Querétaro", path: "M232.6,293.2l-4.8,1.4l-2.7,4.1l4.8,4.1l4.8,0l1.4,4.8l4.8-1.4l1.4-4.1l4.1-1.4l-0.7-4.8L232.6,293.2z" },
  "QROO": { name: "Quintana Roo", path: "M455.5,340.1l-12.9,0l-8.8,3.4l-3.4,15.6l0,12.2l-8.8,8.1l5.4,18.2l-2,9.5l6.1,6.8l8.8-2l0.7-14.2l4.8-24.3l4.8-10.8l8.1-8.1L455.5,340.1z" },
  "SLP": { name: "San Luis Potosí", path: "M244,207.3l-6.8,3.4l-3.4,6.8l0.7,8.8l-8.8,4.1l-2.7,9.5l4.8,6.8l-1.4,9.5l2.7,4.8l6.8,0l1.4-6.1l4.1-1.4l1.4-4.1l6.8-2.7l1.4-8.8l8.8-7.4l3.4-10.2l-2.7-9.5L244,207.3z" },
  "SIN": { name: "Sinaloa", path: "M100.3,149.3l-9.5-2l-6.8,6.8l-4.1,12.2l4.8,14.2l-0.7,8.8l3.4,8.1l6.8,8.8l4.1,0l4.8-5.4l4.1,0l8.1-4.8l4.1,0.7l6.1-8.1l6.8-0.7l2.7-6.1l-0.7-6.8l-6.8,0l-4.8-3.4l0-6.8l4.1-1.4l0.7-4.8l-4.8-4.8l-0.7-8.1l-6.1,5.4l-4.8-6.1L100.3,149.3z" },
  "SON": { name: "Sonora", path: "M100.3,54.3l-4.1-4.1l-8.1,2.7l-5.4,6.8l-4.8,0l-8.8,6.8l-2,8.1l-5.4-2l-3.4,4.8l4.8,9.5l0,4.1l-4.8,4.1l2,8.1l-1.4,6.8l6.8,12.2l4.1,0l1.4-8.8l6.8-10.2l10.2,0l8.8-4.1l6.8,4.1l4.1-6.8l0-9.5l6.8-2.7l9.5,2l4.8-6.1l-4.1-2l-4.8-12.2l6.8-6.8l-4.1-9.5l0-8.1l-4.1,2l-8.8-2.7L100.3,54.3z" },
  "TAB": { name: "Tabasco", path: "M372.6,389.6l-6.8,1.4l-10.2,8.1l-4.8-0.7l-2.7,4.8l8.1,9.5l-4.8,6.1l4.1,1.4l8.8-4.1l6.8-8.8l4.1,0l2-4.8l8.8-6.1l-2-4.8L372.6,389.6z" },
  "TAM": { name: "Tamaulipas", path: "M268.4,171.5l-5.4,0.7l-3.4,6.1l-6.8,6.8l-1.4,6.1l-4.1-0.7l-4.1,6.8l2.7,4.1l-1.4,4.8l4.1,2.7l-0.7,8.1l4.8,1.4l6.8,8.8l8.8,2.7l1.4,8.8l8.8,8.1l6.8,0l1.4-8.8l-8.8-12.2l2-12.2l-4.1-6.8l4.1-8.8l-1.4-11.5l-4.8-6.8L268.4,171.5z" },
  "TLA": { name: "Tlaxcala", path: "M277.2,332.2l-2.7,2l0,4.1l4.1,2.7l4.8-2l0.7-4.1L277.2,332.2z" },
  "VER": { name: "Veracruz", path: "M336.6,292.5l-6.1,2.7l-8.1,0l-1.4,6.8l-8.8,0.7l-4.8,7.4l-6.1,1.4l-1.4,4.1l8.8-2l1.4,4.1l-6.8,4.8l4.8,6.1l1.4,6.8l4.8,2l0.7,10.8l8.8,4.1l0.7,8.1l-6.8,2l2.7,5.4l-5.4,4.1l0.7,8.8l-4.8,4.8l6.8,6.8l6.8-1.4l10.2-8.1l4.8,0.7l4.8-6.1l-2.7-4.8l4.1-4.8l-2-5.4l4.1-9.5l-8.1-17.6l-2-12.2l6.8-15.6l4.1-4.8l-4.1-6.1L336.6,292.5z" },
  "YUC": { name: "Yucatán", path: "M455.5,340.1l-12.2,0l-8.1,4.1l-8.8,0l-6.1,14.9l-2.7,4.1l8.1,4.8l3.4-4.8l2-4.8l8.8-6.1l4.1,0l6.1-4.1L455.5,340.1z" },
  "ZAC": { name: "Zacatecas", path: "M207.5,181.8l-8.1,4.8l0.7,8.1l-6.8,5.4l-1.4,6.1l-8.8,0.7l-1.4,6.1l-6.8,0l-8.8,3.4l4.1,8.1l-0.7,5.4l-6.8,4.1l0.7,8.1l6.8,1.4l4.1,2l2.7-4.1l4.8-1.4l8.1,2.7l4.1,6.8l4.1-2l14.2-4.8l4.1,2l2.7-4.8l-4.8-6.8l2.7-9.5l8.8-4.1l-0.7-8.8l3.4-6.8l6.8-3.4l1.4-4.1l-4.8-2.7l-1.4-6.1l-8.8-2L207.5,181.8z" },
};

function StateShape({ 
  stateCode, 
  stateName,
  path,
  centerCount, 
  isSelected, 
  onClick 
}: { 
  stateCode: string;
  stateName: string;
  path: string;
  centerCount: number; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasCenter = centerCount > 0;
  
  return (
    <g 
      onClick={onClick} 
      className="cursor-pointer transition-all duration-200"
      data-testid={`state-${stateCode.toLowerCase()}`}
    >
      <title>{stateName} ({centerCount} centros)</title>
      <path
        d={path}
        fill={isSelected ? "hsl(var(--primary))" : hasCenter ? "hsl(142 76% 36%)" : "hsl(var(--muted))"}
        stroke="hsl(var(--background))"
        strokeWidth="1"
        className="transition-all duration-200 hover:opacity-80"
      />
    </g>
  );
}

export default function MexicoMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });

  const stateNameMap: Record<string, string> = {
    "Ciudad de México": "CDMX",
    "Nuevo León": "NL",
    "Jalisco": "JAL",
    "Baja California": "BC",
    "Quintana Roo": "QROO",
    "Yucatán": "YUC",
    "Veracruz": "VER",
    "Querétaro": "QRO",
  };

  const getCenterCountByState = (stateCode: string) => {
    const stateName = mexicanStates[stateCode]?.name;
    return centers.filter(c => {
      const centerState = c.state.trim();
      return centerState === stateName || 
             stateNameMap[centerState] === stateCode ||
             centerState.toUpperCase() === stateCode;
    }).length;
  };

  const getStateCodeFromName = (name: string): string | null => {
    const directMatch = stateNameMap[name];
    if (directMatch) return directMatch;
    
    for (const [code, state] of Object.entries(mexicanStates)) {
      if (state.name === name || state.name.toLowerCase() === name.toLowerCase()) {
        return code;
      }
    }
    return null;
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         center.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState ? 
      getStateCodeFromName(center.state) === selectedState : 
      true;
    return matchesSearch && matchesState;
  });

  const selectedStateName = selectedState ? mexicanStates[selectedState]?.name : null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6" data-testid="page-map">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Mapa de la República Mexicana</h1>
          <p className="text-muted-foreground">Visualiza la distribución geográfica de centros</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 overflow-auto">
              <svg 
                viewBox="0 0 500 450" 
                className="w-full h-auto max-h-[500px]"
                data-testid="mexico-svg-map"
              >
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  {Object.entries(mexicanStates).map(([code, state]) => (
                    <StateShape
                      key={code}
                      stateCode={code}
                      stateName={state.name}
                      path={state.path}
                      centerCount={getCenterCountByState(code)}
                      isSelected={selectedState === code}
                      onClick={() => setSelectedState(selectedState === code ? null : code)}
                    />
                  ))}
                </g>
              </svg>

              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-md p-3 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(142 76% 36%)" }}></div>
                  <span>Con centros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted"></div>
                  <span>Sin centros</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-96 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Centros
                {selectedStateName && (
                  <Badge variant="secondary">{selectedStateName}</Badge>
                )}
              </CardTitle>
              {selectedState && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedState(null)}
                  data-testid="button-clear-state-filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-centers"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4 pb-4">
              {filteredCenters.length > 0 ? (
                <div className="space-y-2">
                  {filteredCenters.map((center) => (
                    <Link key={center.id} href={`/centers/${center.id}`}>
                      <div 
                        className="p-3 rounded-md border hover-elevate cursor-pointer"
                        data-testid={`center-card-${center.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{center.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{center.city}, {center.state}</span>
                            </div>
                          </div>
                          <Badge 
                            variant={center.status === 'active' ? 'default' : 'secondary'}
                            className="shrink-0"
                          >
                            {center.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No se encontraron centros</p>
                  <p className="text-sm mt-1">
                    {selectedState ? 'Selecciona otro estado o' : ''} ajusta tu búsqueda
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
