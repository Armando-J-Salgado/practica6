"use server"

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {success, z} from "zod";
import {prisma} from "@/lib/prisma";

const EsquemaReserva = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio. "),
    correo: z.string().email("El correo no es válido"),
    fecha: z.string().min(1, "la fecha es obligatoria."),
    servicioId: z.coerce.number({message: "Debe seleccionar un servicio."}),
});

export async function crearReserva(_estadoPrevio:any, formData: FormData) {
    const campos = EsquemaReserva.safeParse({
        nombre: formData.get("nombre"),
        correo: formData.get("correo"),
        fecha: formData.get("fecha"),
        servicioId: formData.get("servicioId"),
    });

    if(!campos.success) {
        return {
            errores: campos.error.flatten().fieldErrors,
            mensaje: "Error de validación",
        };
    }

    //----------- Determinar si choca con otra reserva -------------
    
        //paso 1: conseguir el servicio o fallar
    const servicio = await prisma.servicio.findUnique({
        where: {id: campos.data.servicioId},
        select: {duracion: true}
    });

    if (!servicio) {
        return {
            mensaje: "Servicio no encontrado. "
        };
    }

        //paso 2: obtener cada reserva con el mismo servicio

    const reservas = await prisma.reserva.findMany({
        where: {servicioId: campos.data.servicioId},
    });

    const serviceDuration = servicio.duracion * 60000;

        //paso 3: para toda reserva de un mismo servicio,
        //comprobar que su rango de tiempo no caiga dentro del rango de otra
    const conflictos = reservas.filter((reserva)=> {
        const start = new Date(reserva.fecha);
        const end = new Date(start.getTime() + serviceDuration);
        const testedStart = new Date(campos.data.fecha);
        const testedEnd = new Date(testedStart.getTime() + serviceDuration);
        
        if(start.getTime() <= testedStart.getTime() && end.getTime() >= testedStart.getTime()) {
            return true;
        } 
        else if (start.getTime() > testedStart.getTime() && start.getTime() < testedEnd.getTime()) {
            return true;
        }

        return false;
    });  
    
    if (conflictos.length > 0) {
        // console.log("Se dispara el error");
        return {mensaje: "No se puede realizar la reserva porque choca con otra"};
    }

    //Crear reserva válida

    await prisma.reserva.create({
        data: {
            nombre: campos.data.nombre,
            correo: campos.data.correo,
            fecha: new Date(campos.data.fecha),
            servicioId: campos.data.servicioId,
        },
    });

    revalidatePath("/reservas");
    redirect("/reservas");
}

export async function eliminarReserva(id: number) {
    try {
        await prisma.reserva.delete({where: {id}});
        revalidatePath("/reservas");
        return {exito: true};
    } catch {
        return {exito: false, mensaje: "No se puedo eliminar la reserva"};
    }
}

export async function cancelarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: {id},
            data: {
                estado: "cancelada"
            }
        });
        revalidatePath("/reservas");
        return {exito: true};
    } catch {
        return {exito: false, mensaje: "No se pudo actualizar la reserva"};
    }
}

export async function confirmarReserva(id: number) {
    try {
        await prisma.reserva.update({
            where: {id},
            data: {
                estado: "confirmada",
            },
        });
        revalidatePath("/reservas");
        return {exito: true};
    } catch {
        return {exito: false, mensaje: "No se pudo confirmar la reserva"};
    }
}