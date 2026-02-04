import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Search, Filter, X } from "lucide-react";
import { Link } from "wouter";
import type { Center } from "@shared/schema";

const mexicanStates = [
  { name: "Aguascalientes", code: "AGS", path: "M180,280 L195,275 L205,285 L195,300 L175,295 Z" },
  { name: "Baja California", code: "BC", path: "M25,50 L70,45 L85,120 L70,200 L30,190 L15,100 Z" },
  { name: "Baja California Sur", code: "BCS", path: "M30,200 L70,205 L80,280 L65,350 L25,340 L15,260 Z" },
  { name: "Campeche", code: "CAM", path: "M420,380 L480,375 L490,420 L460,450 L410,440 Z" },
  { name: "Chiapas", code: "CHP", path: "M370,430 L420,425 L435,480 L400,510 L355,490 Z" },
  { name: "Chihuahua", code: "CHH", path: "M100,80 L200,75 L220,180 L180,220 L90,210 Z" },
  { name: "Ciudad de México", code: "CDMX", path: "M255,345 L275,340 L280,360 L265,370 L250,360 Z" },
  { name: "Coahuila", code: "COA", path: "M140,140 L250,130 L270,200 L220,240 L130,230 Z" },
  { name: "Colima", code: "COL", path: "M145,365 L170,360 L175,385 L155,395 L140,380 Z" },
  { name: "Durango", code: "DUR", path: "M110,200 L200,195 L210,270 L170,300 L100,290 Z" },
  { name: "Estado de México", code: "MEX", path: "M230,330 L280,325 L290,375 L260,390 L220,375 Z" },
  { name: "Guanajuato", code: "GTO", path: "M195,290 L250,285 L260,320 L235,340 L185,330 Z" },
  { name: "Guerrero", code: "GRO", path: "M200,380 L280,375 L290,440 L250,470 L185,450 Z" },
  { name: "Hidalgo", code: "HID", path: "M270,300 L320,295 L330,340 L300,360 L260,345 Z" },
  { name: "Jalisco", code: "JAL", path: "M130,280 L200,275 L215,350 L170,380 L115,360 Z" },
  { name: "Michoacán", code: "MIC", path: "M170,340 L250,335 L260,400 L215,430 L155,410 Z" },
  { name: "Morelos", code: "MOR", path: "M260,370 L290,365 L295,395 L275,410 L255,400 Z" },
  { name: "Nayarit", code: "NAY", path: "M100,260 L145,255 L155,300 L130,330 L90,315 Z" },
  { name: "Nuevo León", code: "NL", path: "M230,160 L300,155 L315,220 L280,250 L220,240 Z" },
  { name: "Oaxaca", code: "OAX", path: "M290,400 L380,395 L395,470 L340,500 L275,480 Z" },
  { name: "Puebla", code: "PUE", path: "M290,340 L360,335 L375,400 L330,430 L275,410 Z" },
  { name: "Querétaro", code: "QRO", path: "M230,290 L270,285 L275,320 L255,335 L225,325 Z" },
  { name: "Quintana Roo", code: "QROO", path: "M490,340 L530,335 L545,420 L510,460 L480,430 Z" },
  { name: "San Luis Potosí", code: "SLP", path: "M200,230 L280,225 L295,300 L250,330 L190,315 Z" },
  { name: "Sinaloa", code: "SIN", path: "M75,180 L140,175 L155,260 L115,300 L65,280 Z" },
  { name: "Sonora", code: "SON", path: "M45,60 L140,55 L160,160 L120,200 L35,185 Z" },
  { name: "Tabasco", code: "TAB", path: "M380,370 L440,365 L455,400 L420,425 L370,410 Z" },
  { name: "Tamaulipas", code: "TAM", path: "M260,170 L340,165 L355,280 L300,320 L250,300 Z" },
  { name: "Tlaxcala", code: "TLA", path: "M285,335 L310,330 L315,355 L300,365 L280,355 Z" },
  { name: "Veracruz", code: "VER", path: "M310,280 L400,275 L415,400 L355,440 L295,410 Z" },
  { name: "Yucatán", code: "YUC", path: "M450,320 L510,315 L520,370 L485,395 L440,380 Z" },
  { name: "Zacatecas", code: "ZAC", path: "M150,220 L220,215 L235,280 L195,310 L140,295 Z" },
];

function StateShape({ 
  state, 
  centerCount, 
  isSelected, 
  onClick 
}: { 
  state: typeof mexicanStates[0]; 
  centerCount: number; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasCenter = centerCount > 0;
  
  return (
    <g 
      onClick={onClick} 
      className="cursor-pointer transition-all duration-200"
      data-testid={`state-${state.code.toLowerCase()}`}
    >
      <path
        d={state.path}
        fill={isSelected ? "hsl(var(--primary))" : hasCenter ? "hsl(var(--primary) / 0.6)" : "hsl(var(--muted))"}
        stroke="hsl(var(--background))"
        strokeWidth="2"
        className="transition-all duration-200 hover:opacity-80"
      />
      {hasCenter && (
        <circle
          cx={state.path.match(/M(\d+)/)?.[1] || 0}
          cy={state.path.match(/M\d+,(\d+)/)?.[1] || 0}
          r="8"
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
      )}
    </g>
  );
}

export default function MexicoMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });

  const getCenterCountByState = (stateCode: string) => {
    return centers.filter(c => c.state.toUpperCase() === stateCode || c.state.toLowerCase() === stateCode.toLowerCase()).length;
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         center.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState ? 
      (center.state.toUpperCase() === selectedState || center.state.toLowerCase() === selectedState.toLowerCase()) : 
      true;
    return matchesSearch && matchesState;
  });

  const selectedStateName = mexicanStates.find(s => s.code === selectedState)?.name;

  return (
    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6" data-testid="page-map">
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Mapa de la República Mexicana</h1>
          <p className="text-muted-foreground">Visualiza la distribución geográfica de centros</p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 overflow-auto">
              <svg 
                viewBox="0 0 560 530" 
                className="w-full h-auto max-h-[500px]"
                data-testid="mexico-svg-map"
              >
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  {mexicanStates.map((state) => (
                    <StateShape
                      key={state.code}
                      state={state}
                      centerCount={getCenterCountByState(state.code)}
                      isSelected={selectedState === state.code}
                      onClick={() => setSelectedState(selectedState === state.code ? null : state.code)}
                    />
                  ))}
                </g>
              </svg>

              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-md p-3 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/60"></div>
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
