import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Search, X } from "lucide-react";
import { Link } from "wouter";
import type { Center } from "@shared/schema";

interface StateData {
  name: string;
  abbr: string;
  d: string;
}

const mexicoStates: StateData[] = [
  { name: "Baja California", abbr: "BC", d: "M52.7,29.3l-3.4-7.6l-6.6-1.1l-8.6,7.2l-3.2,10.7l-0.6,13.1l2.4,15.2l4.4,10.3l1.3,7.4l4.6,10l1.9,3.7l5.4-2.8l1-4.8l-1.5-6.3l3.9-3.5l0-3.2l-3.8-7.8l-1.1-6.9l3.6-2.7l1.4-5.6l-0.6-8.6l-0.5-9l3-4.4l-2.8-4.5L52.7,29.3z" },
  { name: "Baja California Sur", abbr: "BCS", d: "M57.8,98.1l-3.9-2.4l-2.2,0.3l-3.8,5.3l0.3,7l-3.6,7.3l0.1,3.8l3.6,8.1l-2,4.5l-0.2,7.9l2.1,6l-2.9,5.9l-1.1,10.6l2.6,7.4l0.3,5.4l3.7,7.7l7.6,4.5l7.9,0.2l4.1-2.6l0.3-8.9l-3.9-10.9l3.1-18.1l4.4-4.6l-1.1-9.7l-1.1-9.2l-3.7-7.1l-1.4-7.3L57.8,98.1z" },
  { name: "Sonora", abbr: "SON", d: "M63.7,30.9l-6-1.7l-5.3,4.3l-3.5,7l0.5,9l0.6,8.6l-1.4,5.6l-3.6,2.7l1.1,6.9l3.8,7.8l0,3.2l-3.9,3.5l1.5,6.3l-1,4.8l6.7,4.7l10.6,1.3l9.2-2.6l12.1-5l6.5-8.7l7.5-0.9l5.5-5.8l-5.4-13.7l1.3-8.5l-3.1-8.4l-4.7-1.9l-6.1,1.5l-3.8-7.3l-4.3-6.2l-8.2,2.1L63.7,30.9z" },
  { name: "Chihuahua", abbr: "CHI", d: "M99.3,87.5l-5.5,5.8l-7.5,0.9l-6.5,8.7l-12.1,5l-9.2,2.6l-10.6-1.3l2.1,2.9l0.2,7.7l4.8,5.4l-0.3,3.9l-3.9,1.9l0.3,6.4l4.5,3.9l6.5,0.3l1.3,5.5l3.8,1.5l1.3,4l11.1,7.1l2.9,6.4l8.6,5l2.6,6.6l4.1,2.4l0.7,4l8.5,9.3l8.2-0.3l9,2.4l9.1-0.9l4.8-5l10.9-1.5l6.3-8l0.2-6.9l-4.5-6.3l0.7-8.6l-2.5-5.4l3-7.5l-5-4.4l1.4-9.5l-2.6-12.1l2-10.3l-2.8-4.8l-0.2-6.2l-6.8-2.6l-2.5-4.7l-6.2,0.6l-3.9-4.3l-5,0.3l-7.1-7.1l-7.9,2.5L99.3,87.5z" },
  { name: "Coahuila", abbr: "COA", d: "M147.1,101.9l-9.1,0.9l-9-2.4l-8.2,0.3l-8.5-9.3l-0.7-4l-4.1-2.4l-2.6-6.6l-8.6-5l-2.9-6.4l-11.1-7.1l-1.3-4l-3.8-1.5l-1.3-5.5l-6.5-0.3l-4.5-3.9l-0.3-6.4l3.9-1.9l0.3-3.9l-4.8-5.4l-0.2-7.7l6,2.7l8.7-0.7l5.7,7.5l6.3,0l6.2,2.9l6.2,0.3l3.8-3.9l6.7,3l12.9-2.5l6.9,8.2l10.4,13.9l5.7,15l0.2,8.5l-3.5,7.6l1.6,13l-5.7,5.9l0,7.9l-3.5,3.5L147.1,101.9z" },
  { name: "Nuevo León", abbr: "NL", d: "M175.3,118.9l-3.5-10.6l-10.1,4.7l-14.6-1.9l-9.1,0.5l0.6,6.1l3.5-3.5l0-7.9l5.7-5.9l-1.6-13l3.5-7.6l-0.2-8.5l11.5,0.9l6.7,6.3l14.7,27l-6.1,9.9L175.3,118.9z" },
  { name: "Tamaulipas", abbr: "TAM", d: "M175.3,118.9l1-4.3l6.1-9.9l-14.7-27l-6.7-6.3l-11.5-0.9l-5.7-15l4.9,3.3l10.3-0.7l14.4,4.2l14.6,0.3l-0.3,9.4l-4.7,10.5l4.1,7.2l-1.2,11.9l-4.4,7l4,4.1l-1.9,13.1l-4.9,8.7l9.1,9.9l-0.1,5.9l-9.2,4.7l-4.7-5.6l-4,8.9l-7.1,0.5l0.2-14.7l6.6-8l-8.2-12.3l0.5-8.8l4.9-2.5l2.2-9.1L175.3,118.9z" },
  { name: "Sinaloa", abbr: "SIN", d: "M68.8,112.1l-3.8-5.6l-6.5-0.7l-5.7,5.9l-3.4,10.3l4.5,12l-0.3,8.5l2.9,7.1l6.4,8.1l3.6,0l4.6-4.8l3.7,0l8.1-4.4l3.7,0.7l6.3-7.9l6.5-0.5l2.8-6l-0.5-6.9l-6.9,0.2l-4.6-3.2l0-7.1l3.8-1.2l0.7-5.3l-5.1-5.3l-0.3-7.6l-5.7,2.3l-4.5-5.5L68.8,112.1z" },
  { name: "Durango", abbr: "DUR", d: "M97.2,121.6l-6.5,0.5l-6.3,7.9l-3.7-0.7l-8.1,4.4l-3.7,0l-4.6,4.8l-3.6,0l-6.4-8.1l4.4,13.6l-1.7,9.5l2.7,9.7l0.3,8.3l8.5,5.4l6.2,1.5l8.5,9.4l9-3.8l6.9,0l1.3-6.5l8.9-1l1.4-6.2l6.9-5.6l-0.5-7.7l8.1-4.8l0-4.4l-8.5-9.6l-0.6-4.1l-4.5-2.8l-2.6-6.4L97.2,121.6z" },
  { name: "Zacatecas", abbr: "ZAC", d: "M125,155.3l-0.5-7.7l8.1-4.8l0-4.4l-8.5-9.6l-0.6-4.1l-4.5-2.8l-2.6-6.4l-8.2-4.6l-4.5-5.1l-4.3,2.7l-1.4-5l-9,0.3l-2-4.9l-3.5,3.4l0.5,6.9l-2.8,6l4.4,13.6l-1.7,9.5l2.7,9.7l0.3,8.3l8.5,5.4l6.2,1.5l4,7l4.5-2.5l5.1,0l1.4-4.7l7.3-2.4L125,155.3z" },
  { name: "San Luis Potosí", abbr: "SLP", d: "M147.1,101.9l1,6.1l9.1-0.5l14.6,1.9l10.1-4.7l3.5,10.6l-2.2,9.1l-4.9,2.5l-0.5,8.8l8.2,12.3l-6.6,8l-0.2,14.7l-7.5-2.4l-6.3,2.7l-1.2-9.1l-8.8-9.1l-6.5,0l-1.4-9.1l-8.9,7.7l-4.1-2.5l-1.3-8.5l4.5,1.1l0.7-8.5l-7.3,2.4l-1.4,4.7l-5.1,0l-4.5,2.5l-4-7l-8.5-9.4l9-3.8l6.9,0l1.3-6.5l8.9-1l1.4-6.2l6.9-5.6l1.9-0.3l0,4.4l5.9,3.5L147.1,101.9z" },
  { name: "Nayarit", abbr: "NAY", d: "M68,177l-9.6-3.7l-6.2,4.6l-2.6,6.8l-8.8,2.9l-3.5,6.6l5.1,8.3l9.2,4.5l6.3-9.1l8,0l6.5-4.1l0.4-5.1l-1.8-6.2L68,177z" },
  { name: "Jalisco", abbr: "JAL", d: "M100,193.8l-8,0l-6.3,9.1l-9.2-4.5l-5.1-8.3l3.5-6.6l8.8-2.9l2.6-6.8l6.2-4.6l9.6,3.7l3.1,5.4l-3.1,9.2L100,193.8z M97.2,161.2l-8.5-9.4l4.5-2.5l5.1,0l1.4-4.7l7.3-2.4l-0.7,8.5l-4.5-1.1l1.3,8.5l4.1,2.5l8.9-7.7l1.4,9.1l6.5,0l4.4,13.7l-1.8,10.5l-5.1,5.9l-9.7,4l-1.2-5.5l-8.5-8.2l-1.9-10.1l2-5.9l-4.4-2.6L97.2,161.2z" },
  { name: "Aguascalientes", abbr: "AGS", d: "M127.9,168.5l-4.4-13.7l1.4-0.1l0.5,7.7l5,3.7l0.5,6.6l-1,2.3L127.9,168.5z" },
  { name: "Guanajuato", abbr: "GTO", d: "M145.9,152.2l-6.5,0l1.2,9.1l6.3-2.7l7.5,2.4l0.7,5.9l-2.7,6.2l5.1,4.7l6.3-3.9l5.1,0l1.6-4.8l11,0l2.2-5.2l-4.2-4.5l0.7-8.6l-7.9-1.1l-1.6-6.5l-7.6,6.9l-5.7,0l-5.9-3.7l-3.2,6.7L145.9,152.2z" },
  { name: "Querétaro", abbr: "QRO", d: "M172.2,156.4l-7.9-1.1l-1.6-6.5l-7.6,6.9l-5.7,0l-5.9-3.7l0.3,0.3l8.8,9.1l6.5,0l0.7,5.9l7.7,2.7l3.9-7.9L172.2,156.4z" },
  { name: "Hidalgo", abbr: "HID", d: "M172.2,156.4l-0.8,5.7l-3.9,7.9l-7.7-2.7l2.7-6.2l-5.1-4.7l-6.3,3.9l-5.1,0l-1.6,4.8l-11,0l-2.2,5.2l4.2,4.5l-0.7,8.6l8.3,0.3l1.7,6.1l9.5-5.7l1.3-5.9l7.7-1.1l0.5-4.2l7.1-0.8l0-9.9L172.2,156.4z" },
  { name: "Colima", abbr: "COL", d: "M93.6,217.5l-5.7,0l-2.6,4l-4.8,0.9l-1.2,4.5l3.7,5l4.9,1.8l4.2-2.3l2.4-6l0.6-4.4L93.6,217.5z" },
  { name: "Michoacán", abbr: "MIC", d: "M127.9,168.5l2,6.4l-1.2,10.5l-5.1,5.9l-9.7,4l-1.2-5.5l-8.5-8.2l-1.9-10.1l2-5.9l-4.4-2.6l-4.3,11.9l2,10.5l-1.5,10l-5.3,8.6l-4.7,0l-1.2,4.6l4.1,6.6l9.3,2.4l10.4-2l10.7,9.9l10.4-2.4l5.4-9.3l-5.4-8.8l1.2-6.7l5.9-9.2l4.6-1.6l3.4-5.4l0-4.9l-6.3,3.9L127.9,168.5z" },
  { name: "México", abbr: "MEX", d: "M149.6,184.3l-5.4,9.3l5.4,8.8l8.7,1.6l4.3-0.9l2-4.1l4.1-0.7l-1.6-4.1l2-4.3l-1.2-4.6l-4.5-1.6l0-4.4l-3.3-3.1L149.6,184.3z" },
  { name: "Ciudad de México", abbr: "CDMX", d: "M161.4,189.1l-3.9,0.7l-2,4.1l1.6,4.1l4.3,1.6l4.5-2.7l1.4-4.1l-2.2-2.7L161.4,189.1z" },
  { name: "Morelos", abbr: "MOR", d: "M161.4,198.7l-4.5,1.6l-1.9,4.5l2.6,4.5l8.3,0l2.6-3.9l0-4.1L161.4,198.7z" },
  { name: "Tlaxcala", abbr: "TLA", d: "M176.2,188.5l-2.7,2l0,4.1l4.3,2.6l4.5-1.9l0.9-4.3L176.2,188.5z" },
  { name: "Puebla", abbr: "PUE", d: "M168.7,174.2l-3.7,0.8l-1.2,5.9l-9.5,5.7l10.7,8l4.5,1.6l0,4.4l3.3,3.1l-2-4.3l4.1-0.7l2-4.1l4.3,1.6l-0.9,4.3l6.3,0l4.5-5l-0.9-10.5l-4.3-1.9l-1.6-6.9l-4.5-6.2l6.2-5l-1.6-4.5l-8.8,2.4L168.7,174.2z" },
  { name: "Veracruz", abbr: "VER", d: "M171.5,156l-0.8,5.7l0,9.9l-7.1,0.8l-0.5,4.2l-7.7,1.1l9.5,8l4.5,5.2l-0.9,10.5l8.3,4.3l0.7,7.9l-6.2,2.3l2.9,5.1l-5,4.1l0.9,8.8l-4.6,5.1l6.5,6.5l6.5-1.2l10.5-8.7l5-0.9l4.8-5.7l-2.6-4.7l3.8-5l-2.3-5l4.1-9.5l-7.7-17.8l-2-12.1l6.2-15.6l4.1-4.8l-4.5-6.4l-6.5-4l-4.1,8.9l-7.1,0l0.2-14.7l-6.6,8L171.5,156z" },
  { name: "Guerrero", abbr: "GRO", d: "M132.8,217.2l-10.4,2.4l-10.7-9.9l-10.4,2l-9.3-2.4l-4.1-6.6l1.2-4.6l4.7,0l5.3-8.6l1.5-10l-2-10.5l4.3-11.9l4.4,2.6l0.7-2.6l4.3,11.9l8.5,8.2l1.2,5.5l9.7-4l5.1-5.9l1.2-10.5l-2-6.4l4.4-6.6l-3.4,5.4l-4.6,1.6l-5.9,9.2l-1.2,6.7l5.4,8.8l-8.7-1.6l-10.7,8l4.5,1.6l1.2,4.6l-2,4.3l1.6,4.1l8.3,0l-2.6,3.9l8.7,4.3l14.5-2.6l13.7-8.9l1.4-5.3l4.8-2.3l4.7,2l1.5-4.1l-4.8-4.3l-4.6,0l-4.5-5.1l-5.9,0l-10.4,2.4l-4.3-0.9l-2,4.1l-4.1,0.7l2,4.3l-3.3,3.1l4.5,5.2l5.9,0l4.5,5.1l4.6,0l4.8,4.3l-1.5,4.1l-4.7-2l-4.8,2.3l-1.4,5.3l-13.7,8.9L132.8,217.2z" },
  { name: "Oaxaca", abbr: "OAX", d: "M173.9,231.2l-6.5,1.2l-8.7-4.3l2.6-3.9l-8.3,0l0,4.1l-2.6,3.9l-8.7-4.3l-14.5,2.6l2.3,5.3l-4.1,4.8l2.8,5l-4.7,5.9l8.5,4.9l6.8-0.9l8.8,6.3l10.8-8.3l4.7,0l1.6-6.4l8.5-11l0.7-6.5L173.9,231.2z" },
  { name: "Chiapas", abbr: "CHP", d: "M211.9,244.7l-6.5,6.5l0.9,8.8l-4.6,5.1l6.5,6.5l-2.4-4.7l-6.5-1.2l-6.2,2l-6.5-2l-4.6,4.8l-0.7,6.5l-8.5,11l-1.6,6.4l8,0l8.8-2l9.7,5l5,9l4.1,1.4l2.7-2.7l0-6.2l4.7-1.4l1.6-6.4l6.5-2.6l1.4-5.5l-4.1-4.7l0-4.1L211.9,244.7z" },
  { name: "Tabasco", abbr: "TAB", d: "M211.9,244.7l5.2,6.5l2.4-4.7l6.5,1.2l6.2-2l6.5,2l4.6-4.8l0.7-6.5l8.5-11l-1.6-6.4l-4.7,0l-10.8,8.3l-8.8-6.3l-6.8,0.9l-8.5-4.9l4.7-5.9l-2.8-5l4.1-4.8l-2.3-5.3l-13.7,8.9l8.7,4.3l2.6-3.9l0-4.1l-2.6-3.9l2,5.3l-8.3,0l2.6,3.9l8.7,4.3l-6.5,1.2l6.5,6.5l-0.9,8.8L211.9,244.7z" },
  { name: "Campeche", abbr: "CAM", d: "M244.1,228.6l6.5,6.5l-1.4,5.5l-6.5,2.6l-1.6,6.4l-4.7,1.4l0,6.2l-2.7,2.7l-4.1-1.4l-5-9l-9.7-5l-8.8,2l-8,0l4.7,0l10.8-8.3l8.8,6.3l6.8-0.9l8.5,4.9l-4.7,5.9l8.5-11l1.6-6.4L244.1,228.6z" },
  { name: "Yucatán", abbr: "YUC", d: "M244.1,187.7l-7,4.9l-4.5,8.1l4.1,4.4l-0.9,8.9l3.7,7.4l4.6,7.2l10.5,0l7-4.7l-0.3-9l5.4-6.7l-4.1-11.2l-7.4,0l-5.4-5.4L244.1,187.7z" },
  { name: "Quintana Roo", abbr: "QRO2", d: "M261.6,208l5.4,6.7l0.3,9l-7,4.7l-0.3,8.9l-8.3,7.4l5.5,17.8l-2.3,9.3l6.2,6.9l8.5-2l0.5-13.5l4.7-24l5-11.1l7.8-8L261.6,208z" }
];

export default function MexicoMap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  
  const { data: centers = [] } = useQuery<Center[]>({ queryKey: ['/api/centers'] });

  const stateNameMap: Record<string, string[]> = {
    "BC": ["Baja California"],
    "BCS": ["Baja California Sur"],
    "SON": ["Sonora"],
    "CHI": ["Chihuahua"],
    "COA": ["Coahuila", "Coahuila de Zaragoza"],
    "NL": ["Nuevo León"],
    "TAM": ["Tamaulipas"],
    "SIN": ["Sinaloa"],
    "DUR": ["Durango"],
    "ZAC": ["Zacatecas"],
    "SLP": ["San Luis Potosí"],
    "NAY": ["Nayarit"],
    "JAL": ["Jalisco"],
    "AGS": ["Aguascalientes"],
    "GTO": ["Guanajuato"],
    "QRO": ["Querétaro"],
    "HID": ["Hidalgo"],
    "COL": ["Colima"],
    "MIC": ["Michoacán", "Michoacán de Ocampo"],
    "MEX": ["Estado de México", "México"],
    "CDMX": ["Ciudad de México", "CDMX", "Distrito Federal"],
    "MOR": ["Morelos"],
    "TLA": ["Tlaxcala"],
    "PUE": ["Puebla"],
    "VER": ["Veracruz", "Veracruz de Ignacio de la Llave"],
    "GRO": ["Guerrero"],
    "OAX": ["Oaxaca"],
    "CHP": ["Chiapas"],
    "TAB": ["Tabasco"],
    "CAM": ["Campeche"],
    "YUC": ["Yucatán"],
    "QRO2": ["Quintana Roo"],
  };

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

  const selectedStateName = selectedState 
    ? mexicoStates.find(s => s.abbr === selectedState)?.name 
    : null;

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
                  {mexicoStates.find(s => s.abbr === hoveredState)?.name}: {getCenterCountByState(hoveredState)} centro{getCenterCountByState(hoveredState) !== 1 ? 's' : ''}
                </div>
              )}
              
              <svg 
                viewBox="0 15 300 280" 
                className="w-full h-auto max-h-[500px]"
                data-testid="mexico-svg-map"
              >
                <defs>
                  <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <g filter="url(#shadow)">
                  {mexicoStates.map((state) => {
                    const centerCount = getCenterCountByState(state.abbr);
                    const hasCenter = centerCount > 0;
                    const isSelected = selectedState === state.abbr;
                    const isHovered = hoveredState === state.abbr;
                    
                    let fillColor = "hsl(210, 20%, 75%)";
                    if (hasCenter) fillColor = "hsl(142, 70%, 45%)";
                    if (isHovered) fillColor = hasCenter ? "hsl(142, 70%, 55%)" : "hsl(210, 30%, 65%)";
                    if (isSelected) fillColor = "hsl(221, 83%, 53%)";
                    
                    return (
                      <path
                        key={state.abbr}
                        d={state.d}
                        fill={fillColor}
                        stroke="white"
                        strokeWidth="0.5"
                        className="cursor-pointer transition-colors duration-150"
                        onClick={() => setSelectedState(selectedState === state.abbr ? null : state.abbr)}
                        onMouseEnter={() => setHoveredState(state.abbr)}
                        onMouseLeave={() => setHoveredState(null)}
                        data-testid={`state-${state.abbr.toLowerCase()}`}
                      />
                    );
                  })}
                </g>
              </svg>

              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-md p-3 text-xs space-y-2 shadow-md border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(142, 70%, 45%)" }}></div>
                  <span>Con centros</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(210, 20%, 75%)" }}></div>
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
