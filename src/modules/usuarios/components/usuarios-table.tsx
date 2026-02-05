import type { Usuario } from "../types/usuario.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, UserCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UsuariosTableProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

const getRoleBadgeVariant = (rol: string) => {
  switch (rol.toLowerCase()) {
    case "admin":
      return "default";
    case "cajero":
      return "secondary";
    default:
      return "outline";
  }
};

const getRoleLabel = (rol: string) => {
  switch (rol.toLowerCase()) {
    case "admin":
      return "Administrador";
    case "cajero":
      return "Cajero";
    default:
      return rol;
  }
};

export function UsuariosTable({
  usuarios,
  isLoading,
  onEdit,
  onDelete,
}: UsuariosTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[120px]" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Comienza creando tu primer usuario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell className="font-medium">{usuario.nombre}</TableCell>
              <TableCell>@{usuario.nombre_usuario}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(usuario.rol)}>
                  {getRoleLabel(usuario.rol)}
                </Badge>
              </TableCell>
              <TableCell>
                {usuario.creado_en || "-"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(usuario)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(usuario)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
