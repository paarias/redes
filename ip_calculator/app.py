from flask import Flask, render_template, request
import ipaddress

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    data = {}
    if request.method == 'POST':
        ip_input = request.form['ip']
        mask_input = request.form['mask']

        try:
            # Validación de máscara
            if not mask_input.isdigit():
                raise ValueError("La máscara debe ser un número entero.")
            mask_input = int(mask_input)
            if mask_input < 1 or mask_input > 30:
                raise ValueError("La máscara debe estar entre 1 y 30.")

            # Validación de formato IP
            octetos = ip_input.split('.')
            if len(octetos) != 4:
                raise ValueError("La dirección IP debe tener 4 octetos.")
            for octeto in octetos:
                if not octeto.isdigit():
                    raise ValueError("Cada octeto debe ser un número.")
                val = int(octeto)
                if val < 0 or val > 255:
                    raise ValueError("Cada octeto debe estar entre 0 y 255.")

            ip = ipaddress.IPv4Address(ip_input)
            interface = ipaddress.IPv4Interface(f"{ip}/{mask_input}")
            network = interface.network

            # Rechazar clases D y E
            ip_class = get_ip_class(ip_input)
            if ip_class.startswith("Clase D") or ip_class.startswith("Clase E"):
                raise ValueError(f"Dirección de {ip_class} no es válida para redes comunes.")

            # Calcular datos
            data['network'] = str(network.network_address)
            data['broadcast'] = str(network.broadcast_address)
            total_hosts = network.num_addresses - 2 if network.num_addresses > 2 else 0
            data['num_hosts'] = total_hosts

            # Verificar si la IP es red o broadcast
            if ip == network.network_address:
                raise ValueError("La IP ingresada corresponde a la dirección de red.")
            elif ip == network.broadcast_address:
                raise ValueError("La IP ingresada corresponde a la dirección de broadcast.")

            # Confirmar que la IP esté dentro del rango útil
            if total_hosts >= 1:
                hosts = list(network.hosts())
                if ip not in hosts:
                    raise ValueError("La IP no está dentro del rango de hosts válidos.")
                data['host_range'] = f"{hosts[0]} - {hosts[-1]}"
            else:
                data['host_range'] = "No hay hosts disponibles"

            data['ip_class'] = ip_class
            data['is_private'] = "Privada" if ip.is_private else "Pública"
            data['binary_parts'] = get_binary_visual(ip_input, mask_input)

        except Exception as e:
            data['error'] = f"❌ Error: {e}"

    return render_template('index.html', data=data)

def get_ip_class(ip):
    first_octet = int(ip.split('.')[0])
    if 1 <= first_octet <= 126:
        return 'Clase A'
    elif 128 <= first_octet <= 191:
        return 'Clase B'
    elif 192 <= first_octet <= 223:
        return 'Clase C'
    elif 224 <= first_octet <= 239:
        return 'Clase D (Multicast)'
    else:
        return 'Clase E (Experimental)'

def get_binary_visual(ip, mask):
    bin_ip = ''.join(f"{int(oct):08b}" for oct in ip.split('.'))
    html_bin = '<div class="binario-box">'

    for i in range(32):
        bit = bin_ip[i]
        if i < mask:
            html_bin += f"<span class='bit red'>{bit}</span>"
        else:
            html_bin += f"<span class='bit host'>{bit}</span>"

        # Separar por puntos binarios
        if i % 8 == 7 and i != 31:
            html_bin += "<span class='bit'>.</span>"

    html_bin += '</div>'

    html_bin += """
    <div class="binario-leyenda">
        <span class="red">red</span>
        <span class="subred">subred</span>
        <span class="host">host</span>
    </div>
    """

    return html_bin


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

