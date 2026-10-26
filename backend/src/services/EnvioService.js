import zonaEnvioRepository from "../repositories/ZonaEnvioRepository.js";
import configuracionRepository from "../repositories/ConfiguracionRepository.js";
import { BadRequestError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { TipoEntrega } from "../enums/TipoEntrega.js";
import { isOneOf, isPositiveNumber, parseId } from "../utils/validators.js";

class EnvioService {
  listarZonas() {
    return zonaEnvioRepository.findAll();
  }

  obtenerConfiguracion() {
    return { ...configuracionRepository.get() };
  }

  actualizarConfiguracion(datos) {
    if (!isPositiveNumber(datos?.montoMinimoEnvioGratis)) {
      throw new BadRequestError(Messages.MONTO_MINIMO_INVALIDO);
    }
    return { ...configuracionRepository.update({ montoMinimoEnvioGratis: datos.montoMinimoEnvioGratis }) };
  }

  /**
   * Calcula el costo de entrega. RN-04: el envío es gratis cuando el subtotal alcanza
   * el monto mínimo que fija el administrador.
   */
  cotizar({ tipoEntrega, zonaId, subtotal }) {
    if (!isOneOf(tipoEntrega, TipoEntrega)) {
      throw new BadRequestError(Messages.TIPO_ENTREGA_INVALIDO);
    }
    const monto = Number(subtotal);
    if (!isPositiveNumber(monto)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    const { montoMinimoEnvioGratis } = configuracionRepository.get();
    const faltanteParaEnvioGratis = Math.max(0, montoMinimoEnvioGratis - monto);

    if (tipoEntrega === TipoEntrega.RETIRO_LOCAL) {
      return { tipoEntrega, zona: null, costo: 0, envioGratis: false, montoMinimoEnvioGratis, faltanteParaEnvioGratis };
    }

    const zona = zonaEnvioRepository.findById(parseId(zonaId));
    if (!zona) {
      throw new NotFoundError(Messages.ZONA_NOT_FOUND);
    }
    const envioGratis = monto >= montoMinimoEnvioGratis;
    return {
      tipoEntrega,
      zona,
      costo: envioGratis ? 0 : zona.costo,
      envioGratis,
      montoMinimoEnvioGratis,
      faltanteParaEnvioGratis,
    };
  }
}

export default new EnvioService();
