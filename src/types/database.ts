export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      carrito_items: {
        Row: {
          carrito_id: string
          created_at: string
          id: string
          modo_pago: Database["public"]["Enums"]["modo_pago_item_enum"]
          pieza_id: string
        }
        Insert: {
          carrito_id: string
          created_at?: string
          id?: string
          modo_pago?: Database["public"]["Enums"]["modo_pago_item_enum"]
          pieza_id: string
        }
        Update: {
          carrito_id?: string
          created_at?: string
          id?: string
          modo_pago?: Database["public"]["Enums"]["modo_pago_item_enum"]
          pieza_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrito_items_carrito_id_fkey"
            columns: ["carrito_id"]
            isOneToOne: false
            referencedRelation: "carritos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrito_items_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      carritos: {
        Row: {
          cliente_id: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_carrito_enum"]
          id: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_carrito_enum"]
          id?: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_carrito_enum"]
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carritos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          fecha_nacimiento: string | null
          id: string
          nombre: string
          notas: string | null
          preferencia_contacto:
            | Database["public"]["Enums"]["preferencia_contacto_enum"]
            | null
          razon_social: string | null
          regimen_fiscal: string | null
          rfc: string | null
          telefono: string | null
          tipo_cliente: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre: string
          notas?: string | null
          preferencia_contacto?:
            | Database["public"]["Enums"]["preferencia_contacto_enum"]
            | null
          razon_social?: string | null
          regimen_fiscal?: string | null
          rfc?: string | null
          telefono?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Update: {
          created_at?: string
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          preferencia_contacto?:
            | Database["public"]["Enums"]["preferencia_contacto_enum"]
            | null
          razon_social?: string | null
          regimen_fiscal?: string | null
          rfc?: string | null
          telefono?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Relationships: []
      }
      clientes_historial_estatus: {
        Row: {
          admin_id: string | null
          cliente_id: string
          fecha: string
          id: string
          motivo: string | null
          tipo_cliente_anterior:
            | Database["public"]["Enums"]["tipo_cliente_enum"]
            | null
          tipo_cliente_nuevo: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Insert: {
          admin_id?: string | null
          cliente_id: string
          fecha?: string
          id?: string
          motivo?: string | null
          tipo_cliente_anterior?:
            | Database["public"]["Enums"]["tipo_cliente_enum"]
            | null
          tipo_cliente_nuevo: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Update: {
          admin_id?: string | null
          cliente_id?: string
          fecha?: string
          id?: string
          motivo?: string | null
          tipo_cliente_anterior?:
            | Database["public"]["Enums"]["tipo_cliente_enum"]
            | null
          tipo_cliente_nuevo?: Database["public"]["Enums"]["tipo_cliente_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "clientes_historial_estatus_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_sistema: {
        Row: {
          clave: string
          descripcion: string | null
          updated_at: string
          valor: string
        }
        Insert: {
          clave: string
          descripcion?: string | null
          updated_at?: string
          valor: string
        }
        Update: {
          clave?: string
          descripcion?: string | null
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      configuracion_sistema_historial: {
        Row: {
          admin_id: string | null
          clave: string
          fecha: string
          id: string
          motivo: string | null
          valor_anterior: string | null
          valor_nuevo: string
        }
        Insert: {
          admin_id?: string | null
          clave: string
          fecha?: string
          id?: string
          motivo?: string | null
          valor_anterior?: string | null
          valor_nuevo: string
        }
        Update: {
          admin_id?: string | null
          clave?: string
          fecha?: string
          id?: string
          motivo?: string | null
          valor_anterior?: string | null
          valor_nuevo?: string
        }
        Relationships: []
      }
      cortes: {
        Row: {
          aplica_a: Database["public"]["Enums"]["aplica_a_corte_enum"]
          id: string
          nombre: string
        }
        Insert: {
          aplica_a?: Database["public"]["Enums"]["aplica_a_corte_enum"]
          id?: string
          nombre: string
        }
        Update: {
          aplica_a?: Database["public"]["Enums"]["aplica_a_corte_enum"]
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      direcciones: {
        Row: {
          calle: string
          ciudad: string
          cliente_id: string
          codigo_postal: string
          colonia: string
          created_at: string
          destinatario: string
          es_predeterminada: boolean
          estado: string
          id: string
          numero_exterior: string
          numero_interior: string | null
          pais: string
          referencias: string | null
          telefono_contacto: string | null
          tipo: Database["public"]["Enums"]["tipo_direccion_enum"]
        }
        Insert: {
          calle: string
          ciudad: string
          cliente_id: string
          codigo_postal: string
          colonia: string
          created_at?: string
          destinatario: string
          es_predeterminada?: boolean
          estado: string
          id?: string
          numero_exterior: string
          numero_interior?: string | null
          pais?: string
          referencias?: string | null
          telefono_contacto?: string | null
          tipo?: Database["public"]["Enums"]["tipo_direccion_enum"]
        }
        Update: {
          calle?: string
          ciudad?: string
          cliente_id?: string
          codigo_postal?: string
          colonia?: string
          created_at?: string
          destinatario?: string
          es_predeterminada?: boolean
          estado?: string
          id?: string
          numero_exterior?: string
          numero_interior?: string | null
          pais?: string
          referencias?: string | null
          telefono_contacto?: string | null
          tipo?: Database["public"]["Enums"]["tipo_direccion_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "direcciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      metales: {
        Row: {
          id: string
          kilataje: string | null
          nombre: string
          tipo_base: Database["public"]["Enums"]["tipo_base_metal_enum"]
        }
        Insert: {
          id?: string
          kilataje?: string | null
          nombre: string
          tipo_base: Database["public"]["Enums"]["tipo_base_metal_enum"]
        }
        Update: {
          id?: string
          kilataje?: string | null
          nombre?: string
          tipo_base?: Database["public"]["Enums"]["tipo_base_metal_enum"]
        }
        Relationships: []
      }
      movimientos_inventario: {
        Row: {
          created_at: string
          estado_anterior: string | null
          estado_nuevo: string | null
          evento: string
          id: string
          motivo: string | null
          pedido_id: string | null
          pieza_id: string
        }
        Insert: {
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo?: string | null
          evento: string
          id?: string
          motivo?: string | null
          pedido_id?: string | null
          pieza_id: string
        }
        Update: {
          created_at?: string
          estado_anterior?: string | null
          estado_nuevo?: string | null
          evento?: string
          id?: string
          motivo?: string | null
          pedido_id?: string | null
          pieza_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_inventario_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          estado_pasarela: Database["public"]["Enums"]["estado_pasarela_enum"]
          fecha: string
          id: string
          link_pago: string | null
          metodo: Database["public"]["Enums"]["metodo_pago_enum"]
          moneda_pago: Database["public"]["Enums"]["moneda_enum"]
          monto: number
          monto_moneda_pago: number | null
          monto_mxn_equivalente: number | null
          pasarela: Database["public"]["Enums"]["pasarela_pago_enum"]
          pedido_id: string
          referencia_externa: string | null
          tipo_cambio_aplicado: number | null
          tipo_cambio_id: string | null
        }
        Insert: {
          estado_pasarela?: Database["public"]["Enums"]["estado_pasarela_enum"]
          fecha?: string
          id?: string
          link_pago?: string | null
          metodo: Database["public"]["Enums"]["metodo_pago_enum"]
          moneda_pago?: Database["public"]["Enums"]["moneda_enum"]
          monto: number
          monto_moneda_pago?: number | null
          monto_mxn_equivalente?: number | null
          pasarela?: Database["public"]["Enums"]["pasarela_pago_enum"]
          pedido_id: string
          referencia_externa?: string | null
          tipo_cambio_aplicado?: number | null
          tipo_cambio_id?: string | null
        }
        Update: {
          estado_pasarela?: Database["public"]["Enums"]["estado_pasarela_enum"]
          fecha?: string
          id?: string
          link_pago?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pago_enum"]
          moneda_pago?: Database["public"]["Enums"]["moneda_enum"]
          monto?: number
          monto_moneda_pago?: number | null
          monto_mxn_equivalente?: number | null
          pasarela?: Database["public"]["Enums"]["pasarela_pago_enum"]
          pedido_id?: string
          referencia_externa?: string | null
          tipo_cambio_aplicado?: number | null
          tipo_cambio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_tipo_cambio_id_fkey"
            columns: ["tipo_cambio_id"]
            isOneToOne: false
            referencedRelation: "tipos_cambio"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          id: string
          pedido_id: string
          pieza_id: string
          precio_acordado: number
        }
        Insert: {
          id?: string
          pedido_id: string
          pieza_id: string
          precio_acordado: number
        }
        Update: {
          id?: string
          pedido_id?: string
          pieza_id?: string
          precio_acordado?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          ajuste_monto: number | null
          ajuste_motivo: string | null
          cliente_id: string
          direccion_envio_snapshot: Json | null
          direccion_id: string | null
          estado: Database["public"]["Enums"]["estado_pedido_enum"]
          fecha: string
          id: string
          moneda_cotizada: Database["public"]["Enums"]["moneda_enum"]
          motivo: string | null
          tipo: Database["public"]["Enums"]["tipo_pedido_enum"]
          tipo_cambio_id: string | null
          total_moneda_cotizada: number | null
          total_mxn: number | null
        }
        Insert: {
          ajuste_monto?: number | null
          ajuste_motivo?: string | null
          cliente_id: string
          direccion_envio_snapshot?: Json | null
          direccion_id?: string | null
          estado?: Database["public"]["Enums"]["estado_pedido_enum"]
          fecha?: string
          id?: string
          moneda_cotizada?: Database["public"]["Enums"]["moneda_enum"]
          motivo?: string | null
          tipo: Database["public"]["Enums"]["tipo_pedido_enum"]
          tipo_cambio_id?: string | null
          total_moneda_cotizada?: number | null
          total_mxn?: number | null
        }
        Update: {
          ajuste_monto?: number | null
          ajuste_motivo?: string | null
          cliente_id?: string
          direccion_envio_snapshot?: Json | null
          direccion_id?: string | null
          estado?: Database["public"]["Enums"]["estado_pedido_enum"]
          fecha?: string
          id?: string
          moneda_cotizada?: Database["public"]["Enums"]["moneda_enum"]
          motivo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_pedido_enum"]
          tipo_cambio_id?: string | null
          total_moneda_cotizada?: number | null
          total_mxn?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_direccion_id_fkey"
            columns: ["direccion_id"]
            isOneToOne: false
            referencedRelation: "direcciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_tipo_cambio_id_fkey"
            columns: ["tipo_cambio_id"]
            isOneToOne: false
            referencedRelation: "tipos_cambio"
            referencedColumns: ["id"]
          },
        ]
      }
      piedras: {
        Row: {
          es_preciosa: boolean
          id: string
          nombre: string
        }
        Insert: {
          es_preciosa?: boolean
          id?: string
          nombre: string
        }
        Update: {
          es_preciosa?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      piezas: {
        Row: {
          created_at: string
          descripcion: string | null
          destacada: boolean
          estado_inventario: Database["public"]["Enums"]["estado_inventario_enum"]
          estado_publicacion: Database["public"]["Enums"]["estado_publicacion_enum"]
          id: string
          metal_id: string
          nombre: string
          peso_gramos: number
          precio: number
          precio_mayoreo: number | null
          sku: string
          sku_manual: string | null
          sku_proveedor: string | null
          slug: string
          tipo_pieza_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          destacada?: boolean
          estado_inventario?: Database["public"]["Enums"]["estado_inventario_enum"]
          estado_publicacion?: Database["public"]["Enums"]["estado_publicacion_enum"]
          id?: string
          metal_id: string
          nombre: string
          peso_gramos: number
          precio: number
          precio_mayoreo?: number | null
          sku: string
          sku_manual?: string | null
          sku_proveedor?: string | null
          slug: string
          tipo_pieza_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          destacada?: boolean
          estado_inventario?: Database["public"]["Enums"]["estado_inventario_enum"]
          estado_publicacion?: Database["public"]["Enums"]["estado_publicacion_enum"]
          id?: string
          metal_id?: string
          nombre?: string
          peso_gramos?: number
          precio?: number
          precio_mayoreo?: number | null
          sku?: string
          sku_manual?: string | null
          sku_proveedor?: string | null
          slug?: string
          tipo_pieza_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "piezas_metal_id_fkey"
            columns: ["metal_id"]
            isOneToOne: false
            referencedRelation: "metales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piezas_tipo_pieza_id_fkey"
            columns: ["tipo_pieza_id"]
            isOneToOne: false
            referencedRelation: "tipos_pieza"
            referencedColumns: ["id"]
          },
        ]
      }
      piezas_media: {
        Row: {
          es_principal: boolean
          id: string
          orden: number
          pieza_id: string
          tipo: Database["public"]["Enums"]["tipo_media_enum"]
          url: string
        }
        Insert: {
          es_principal?: boolean
          id?: string
          orden?: number
          pieza_id: string
          tipo?: Database["public"]["Enums"]["tipo_media_enum"]
          url: string
        }
        Update: {
          es_principal?: boolean
          id?: string
          orden?: number
          pieza_id?: string
          tipo?: Database["public"]["Enums"]["tipo_media_enum"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "piezas_media_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      piezas_piedras: {
        Row: {
          cantidad: number
          claridad: string | null
          color: string | null
          corte_id: string | null
          es_principal: boolean
          id: string
          kilataje_piedra: number | null
          piedra_id: string
          pieza_id: string
        }
        Insert: {
          cantidad?: number
          claridad?: string | null
          color?: string | null
          corte_id?: string | null
          es_principal?: boolean
          id?: string
          kilataje_piedra?: number | null
          piedra_id: string
          pieza_id: string
        }
        Update: {
          cantidad?: number
          claridad?: string | null
          color?: string | null
          corte_id?: string | null
          es_principal?: boolean
          id?: string
          kilataje_piedra?: number | null
          piedra_id?: string
          pieza_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "piezas_piedras_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piezas_piedras_piedra_id_fkey"
            columns: ["piedra_id"]
            isOneToOne: false
            referencedRelation: "piedras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "piezas_piedras_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
        ]
      }
      reembolsos: {
        Row: {
          admin_id: string | null
          estado: string
          fecha: string
          id: string
          monto_reembolsado: number
          motivo: string | null
          pago_id: string
        }
        Insert: {
          admin_id?: string | null
          estado?: string
          fecha?: string
          id?: string
          monto_reembolsado: number
          motivo?: string | null
          pago_id: string
        }
        Update: {
          admin_id?: string | null
          estado?: string
          fecha?: string
          id?: string
          monto_reembolsado?: number
          motivo?: string | null
          pago_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reembolsos_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitud_consignacion_items: {
        Row: {
          estado_item: Database["public"]["Enums"]["estado_item_solicitud_enum"]
          id: string
          pieza_id: string
          precio_mayoreo_congelado: number
          solicitud_id: string
        }
        Insert: {
          estado_item?: Database["public"]["Enums"]["estado_item_solicitud_enum"]
          id?: string
          pieza_id: string
          precio_mayoreo_congelado: number
          solicitud_id: string
        }
        Update: {
          estado_item?: Database["public"]["Enums"]["estado_item_solicitud_enum"]
          id?: string
          pieza_id?: string
          precio_mayoreo_congelado?: number
          solicitud_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitud_consignacion_items_pieza_id_fkey"
            columns: ["pieza_id"]
            isOneToOne: false
            referencedRelation: "piezas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitud_consignacion_items_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes_consignacion"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes_consignacion: {
        Row: {
          admin_id: string | null
          cliente_id: string
          descuento_valor: number | null
          estado: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion: string | null
          fecha_solicitud: string
          id: string
          monto_total_autorizado: number | null
          monto_total_original: number
          notas_negociacion: string | null
          pedido_id: string | null
          tipo_descuento:
            | Database["public"]["Enums"]["tipo_descuento_enum"]
            | null
        }
        Insert: {
          admin_id?: string | null
          cliente_id: string
          descuento_valor?: number | null
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion?: string | null
          fecha_solicitud?: string
          id?: string
          monto_total_autorizado?: number | null
          monto_total_original: number
          notas_negociacion?: string | null
          pedido_id?: string | null
          tipo_descuento?:
            | Database["public"]["Enums"]["tipo_descuento_enum"]
            | null
        }
        Update: {
          admin_id?: string | null
          cliente_id?: string
          descuento_valor?: number | null
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion?: string | null
          fecha_solicitud?: string
          id?: string
          monto_total_autorizado?: number | null
          monto_total_original?: number
          notas_negociacion?: string | null
          pedido_id?: string | null
          tipo_descuento?:
            | Database["public"]["Enums"]["tipo_descuento_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_consignacion_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_consignacion_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes_cuenta_consigna: {
        Row: {
          admin_id: string | null
          cliente_id: string
          estado: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion: string | null
          fecha_solicitud: string
          id: string
          motivo_rechazo: string | null
          origen_solicitud: Database["public"]["Enums"]["origen_solicitud_enum"]
        }
        Insert: {
          admin_id?: string | null
          cliente_id: string
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion?: string | null
          fecha_solicitud?: string
          id?: string
          motivo_rechazo?: string | null
          origen_solicitud?: Database["public"]["Enums"]["origen_solicitud_enum"]
        }
        Update: {
          admin_id?: string | null
          cliente_id?: string
          estado?: Database["public"]["Enums"]["estado_solicitud_enum"]
          fecha_resolucion?: string | null
          fecha_solicitud?: string
          id?: string
          motivo_rechazo?: string | null
          origen_solicitud?: Database["public"]["Enums"]["origen_solicitud_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_cuenta_consigna_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_cambio: {
        Row: {
          created_at: string
          fecha: string
          fuente: string
          id: string
          serie: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          fecha: string
          fuente: string
          id?: string
          serie?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          fecha?: string
          fuente?: string
          id?: string
          serie?: string | null
          valor?: number
        }
        Relationships: []
      }
      tipos_pieza: {
        Row: {
          id: string
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          id?: string
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          id?: string
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      piezas_reservadas_mayoreo: {
        Row: {
          cliente_id: string | null
          pieza_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      aplica_a_corte_enum: "piedra" | "metal"
      estado_carrito_enum: "activo" | "convertido" | "abandonado"
      estado_inventario_enum:
        | "disponible"
        | "apartada"
        | "en_consigna"
        | "vendida"
        | "en_revision"
      estado_item_solicitud_enum: "vigente" | "perdido_por_venta"
      estado_pasarela_enum:
        | "pendiente"
        | "completado"
        | "fallido"
        | "reembolsado"
      estado_pedido_enum: "abierto" | "cerrado" | "cancelado" | "devuelto"
      estado_publicacion_enum: "borrador" | "publicada" | "archivada"
      estado_solicitud_enum: "pendiente" | "aprobada" | "rechazada"
      metodo_pago_enum: "efectivo" | "transferencia" | "tarjeta" | "otro"
      modo_pago_item_enum: "contado" | "consigna"
      moneda_enum: "mxn" | "usd"
      origen_solicitud_enum: "autoservicio" | "invitacion_directa"
      pasarela_pago_enum: "manual" | "stripe" | "mercado_pago"
      preferencia_contacto_enum: "whatsapp" | "llamada" | "email"
      tipo_base_metal_enum: "plata" | "oro" | "otro"
      tipo_cliente_enum: "regular" | "consigna"
      tipo_descuento_enum: "porcentaje" | "monto_fijo"
      tipo_direccion_enum: "envio" | "facturacion"
      tipo_media_enum: "foto" | "video" | "360"
      tipo_pedido_enum: "venta_directa" | "consignacion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      aplica_a_corte_enum: ["piedra", "metal"],
      estado_carrito_enum: ["activo", "convertido", "abandonado"],
      estado_inventario_enum: [
        "disponible",
        "apartada",
        "en_consigna",
        "vendida",
        "en_revision",
      ],
      estado_item_solicitud_enum: ["vigente", "perdido_por_venta"],
      estado_pasarela_enum: [
        "pendiente",
        "completado",
        "fallido",
        "reembolsado",
      ],
      estado_pedido_enum: ["abierto", "cerrado", "cancelado", "devuelto"],
      estado_publicacion_enum: ["borrador", "publicada", "archivada"],
      estado_solicitud_enum: ["pendiente", "aprobada", "rechazada"],
      metodo_pago_enum: ["efectivo", "transferencia", "tarjeta", "otro"],
      modo_pago_item_enum: ["contado", "consigna"],
      moneda_enum: ["mxn", "usd"],
      origen_solicitud_enum: ["autoservicio", "invitacion_directa"],
      pasarela_pago_enum: ["manual", "stripe", "mercado_pago"],
      preferencia_contacto_enum: ["whatsapp", "llamada", "email"],
      tipo_base_metal_enum: ["plata", "oro", "otro"],
      tipo_cliente_enum: ["regular", "consigna"],
      tipo_descuento_enum: ["porcentaje", "monto_fijo"],
      tipo_direccion_enum: ["envio", "facturacion"],
      tipo_media_enum: ["foto", "video", "360"],
      tipo_pedido_enum: ["venta_directa", "consignacion"],
    },
  },
} as const

