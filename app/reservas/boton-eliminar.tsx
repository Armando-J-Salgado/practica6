"use client"; 
 
import { cancelarReserva } from "@/app/actions/reservas"; 
import { useState } from "react"; 
import { botonPeligro, botonDisabled } from "@/app/lib/estilos"; 

export function BotonCancelarReserva({ id , estado }: { id: number, estado: string }) { 
  const [error, setError] = useState<string | null>(null); 
 
  async function manejarClick() { 
    if (estado === "cancelada") {return}
    const resultado = await cancelarReserva(id); 
    if (!resultado.exito) { 
      setError(resultado.mensaje ?? "Error desconocido."); 
    } 
  } 
 
  return ( 
    <div className="text-right shrink-0 ml-4"> 
      <button onClick={manejarClick} className={`${estado === "cancelada" ? botonDisabled : botonPeligro}`}> 
        Cancelar
      </button> 
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>} 
    </div> 
  ); 
} 