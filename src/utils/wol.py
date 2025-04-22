# wakemate_companion/utils/wol.py
import socket
import re

def send_magic_packet(mac: str,
                      broadcast: str = "255.255.255.255",
                      port: int = 9) -> None:
    """
    Fire a Wake‑on‑LAN magic packet.

    Args:
        mac: MAC address in any common delimiter format.
        broadcast: Broadcast IP on the LAN.
        port: UDP port (7 or 9 are standard).
    """
    # Normalise MAC → six bytes
    mac_hex = re.sub(r'[^0-9A-Fa-f]', '', mac)
    if len(mac_hex) != 12:
        raise ValueError("MAC address must be 6 bytes long")

    payload = bytes.fromhex('FF' * 6 + mac_hex * 16)

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.sendto(payload, (broadcast, port))
