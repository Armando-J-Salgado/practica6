"use client"

import { confirmarReserva } from "../actions/reservas";
import { useState } from "react"; 
import { botonConfirmar, botonDisabled } from "@/app/lib/estilos"; 

export function BotonConfimarReserva({ id , estado}: { id: number, estado: string }) { 
  const [error, setError] = useState<string | null>(null); 
 
  async function manejarClick() { 
    if (estado === "confirmada") {return}
    const resultado = await confirmarReserva(id); 
    if (!resultado.exito) { 
      setError(resultado.mensaje ?? "Error desconocido."); 
    } 
  } 
 
  return ( 
    <div className="text-right shrink-0 ml-4"> 
      <button onClick={manejarClick} className={`${estado === "confirmada" ? botonDisabled : botonConfirmar}`}> 
        Confirmar
      </button> 
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>} 
    </div> 
  ); 
} 
