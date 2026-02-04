import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Search, X } from "lucide-react";
import { Link } from "wouter";
import type { Center } from "@shared/schema";

const stateNameMap: Record<string, string[]> = {
  "BCN": ["Baja California"],
  "BCS": ["Baja California Sur"],
  "SON": ["Sonora"],
  "CHH": ["Chihuahua"],
  "COA": ["Coahuila", "Coahuila de Zaragoza"],
  "NLE": ["Nuevo León", "Nuevo Leon"],
  "TAM": ["Tamaulipas"],
  "SIN": ["Sinaloa"],
  "DUR": ["Durango"],
  "ZAC": ["Zacatecas"],
  "SLP": ["San Luis Potosí", "San Luis Potosi"],
  "NAY": ["Nayarit"],
  "JAL": ["Jalisco"],
  "AGU": ["Aguascalientes"],
  "GUA": ["Guanajuato"],
  "QUE": ["Querétaro", "Queretaro"],
  "HID": ["Hidalgo"],
  "COL": ["Colima"],
  "MIC": ["Michoacán", "Michoacan", "Michoacán de Ocampo"],
  "MEX": ["Estado de México", "Estado de Mexico", "México", "Mexico"],
  "CMX": ["Ciudad de México", "Ciudad de Mexico", "CDMX", "Distrito Federal"],
  "MOR": ["Morelos"],
  "TLA": ["Tlaxcala"],
  "PUE": ["Puebla"],
  "VER": ["Veracruz", "Veracruz de Ignacio de la Llave"],
  "GRO": ["Guerrero"],
  "OAX": ["Oaxaca"],
  "CHP": ["Chiapas"],
  "TAB": ["Tabasco"],
  "CAM": ["Campeche"],
  "YUC": ["Yucatán", "Yucatan"],
  "ROO": ["Quintana Roo"],
};

const stateDisplayNames: Record<string, string> = {
  "BCN": "Baja California",
  "BCS": "Baja California Sur",
  "SON": "Sonora",
  "CHH": "Chihuahua",
  "COA": "Coahuila",
  "NLE": "Nuevo León",
  "TAM": "Tamaulipas",
  "SIN": "Sinaloa",
  "DUR": "Durango",
  "ZAC": "Zacatecas",
  "SLP": "San Luis Potosí",
  "NAY": "Nayarit",
  "JAL": "Jalisco",
  "AGU": "Aguascalientes",
  "GUA": "Guanajuato",
  "QUE": "Querétaro",
  "HID": "Hidalgo",
  "COL": "Colima",
  "MIC": "Michoacán",
  "MEX": "Estado de México",
  "CMX": "Ciudad de México",
  "MOR": "Morelos",
  "TLA": "Tlaxcala",
  "PUE": "Puebla",
  "VER": "Veracruz",
  "GRO": "Guerrero",
  "OAX": "Oaxaca",
  "CHP": "Chiapas",
  "TAB": "Tabasco",
  "CAM": "Campeche",
  "YUC": "Yucatán",
  "ROO": "Quintana Roo",
};

export default function MexicoMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });

  const getCenterCountByState = useMemo(() => {
    return (abbr: string) => {
      const stateNames = stateNameMap[abbr] || [];
      return centers.filter(c => 
        stateNames.some(name => 
          c.state.toLowerCase() === name.toLowerCase()
        )
      ).length;
    };
  }, [centers]);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch('/assets/mexico-map.svg');
        const svgText = await response.text();
        
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svgText;
          
          const svgElement = svgContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.setAttribute('class', 'w-full h-auto max-h-[500px]');
            svgElement.setAttribute('data-testid', 'mexico-svg-map');
            
            const paths = svgElement.querySelectorAll('path[id^="MX"]');
            paths.forEach((path) => {
              const id = path.getAttribute('id');
              if (id) {
                const abbr = id.replace('MX', '');
                path.setAttribute('data-abbr', abbr);
                path.setAttribute('data-testid', `state-${abbr.toLowerCase()}`);
                path.style.cursor = 'pointer';
                path.style.transition = 'fill 0.15s ease';
              }
            });
            
            const circles = svgElement.querySelectorAll('circle');
            circles.forEach(circle => circle.remove());
            
            setSvgLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSvg();
  }, []);

  useEffect(() => {
    if (!svgLoaded || !svgContainerRef.current) return;

    const paths = svgContainerRef.current.querySelectorAll('path[data-abbr]');
    
    paths.forEach((path) => {
      const abbr = path.getAttribute('data-abbr');
      if (!abbr) return;

      const centerCount = getCenterCountByState(abbr);
      const hasCenter = centerCount > 0;
      const isSelected = selectedState === abbr;
      const isHovered = hoveredState === abbr;
      
      let fillColor = "#a8c5d9";
      if (hasCenter) fillColor = "#22c55e";
      if (isHovered) fillColor = hasCenter ? "#4ade80" : "#7cb3d1";
      if (isSelected) fillColor = "#3b82f6";
      
      (path as SVGPathElement).style.fill = fillColor;
    });
  }, [svgLoaded, centers, selectedState, hoveredState, getCenterCountByState]);

  useEffect(() => {
    if (!svgLoaded || !svgContainerRef.current) return;

    const paths = svgContainerRef.current.querySelectorAll('path[data-abbr]');
    
    const handleClick = (e: Event) => {
      const abbr = (e.currentTarget as Element).getAttribute('data-abbr');
      if (abbr) {
        setSelectedState(prev => prev === abbr ? null : abbr);
      }
    };

    const handleMouseEnter = (e: Event) => {
      const abbr = (e.currentTarget as Element).getAttribute('data-abbr');
      if (abbr) {
        setHoveredState(abbr);
      }
    };

    const handleMouseLeave = () => {
      setHoveredState(null);
    };

    paths.forEach((path) => {
      path.addEventListener('click', handleClick);
      path.addEventListener('mouseenter', handleMouseEnter);
      path.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      paths.forEach((path) => {
        path.removeEventListener('click', handleClick);
        path.removeEventListener('mouseenter', handleMouseEnter);
        path.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [svgLoaded]);

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         center.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedState) return matchesSearch;
    
    const stateNames = stateNameMap[selectedState] || [];
    const matchesState = stateNames.some(name => 
      center.state.toLowerCase() === name.toLowerCase()
    );
    
    return matchesSearch && matchesState;
  });

  const selectedStateName = selectedState ? stateDisplayNames[selectedState] : null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6" data-testid="page-map">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Mapa de la República Mexicana</h1>
          <p className="text-muted-foreground">Visualiza la distribución geográfica de centros</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="relative bg-gradient-to-br from-sky-50 to-sky-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
              {hoveredState && (
                <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm rounded-md px-3 py-2 text-sm shadow-md border">
                  {stateDisplayNames[hoveredState]}: {getCenterCountByState(hoveredState)} centro{getCenterCountByState(hoveredState) !== 1 ? 's' : ''}
                </div>
              )}
              
              <div 
                ref={svgContainerRef}
                className="w-full"
              />

              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-md p-3 text-xs space-y-2 shadow-md border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></div>
                  <span>Con centros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "#a8c5d9" }}></div>
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
