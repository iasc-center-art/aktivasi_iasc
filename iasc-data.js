function iascAngka(v) {
    return parseInt(String(v).replace(/[^\d]/g, ""), 10) || 0;
}

function iascFormatNum(n) {
    return iascAngka(n).toLocaleString("id-ID");
}

function iascAmbil(text, label) {
    var rg = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*(.+)", "i");
    var m = text.match(rg);
    return m ? m[1].trim() : "";
}

function iascParseInput(text) {
    var nama = iascAmbil(text, "A/n rekening penerima");
    var bank = iascAmbil(text, "Bank / e-wallet penerima");
    var kerugian = iascAngka(iascAmbil(text, "Total kerugian"));
    if (!nama || !bank || kerugian <= 0) {
        return null;
    }
    return { nama: nama, bank: bank, kerugian: kerugian, aktivasi: 249000 };
}

function iascParseOutput(text) {
    var namaM = text.match(/atas nama\s*\*([^*]+)\*/i);
    var bankM = text.match(/rekening\s*\*([^*]+)\*\s*atas nama/i);
    var saldoM = text.match(/Saldo Utama\s*:\s*\*Rp\.?([\d.,]+)\*/i)
        || text.match(/dana sebesar\s*Rp\.?([\d.,]+)/i);
    var feeM = text.match(/Biaya aktivasi saldo:\s*\*Rp\.?([\d.,]+)\*/i);

    var nama = namaM ? namaM[1].trim() : "";
    var bank = bankM ? bankM[1].trim() : "";
    var kerugian = saldoM ? iascAngka(saldoM[1]) : 0;
    var aktivasi = feeM ? iascAngka(feeM[1]) : 1000000;

    if (!nama || !bank || kerugian <= 0) {
        return null;
    }
    return { nama: nama, bank: bank, kerugian: kerugian, aktivasi: aktivasi };
}

function iascParseText(text) {
    return iascParseInput(text) || iascParseOutput(text);
}

function iascToActivasiPayload(d, qrImage) {
    return {
        receiverName: d.nama,
        receiverBank: d.bank,
        totalFormatted: iascFormatNum(d.kerugian),
        feeFormatted: iascFormatNum(d.aktivasi),
        qrImage: qrImage || "QR.png",
    };
}

function iascSaveActivasiPrefill(payload) {
    try {
        sessionStorage.setItem("iasc_activasi_prefill", JSON.stringify(payload));
    } catch (e) {}
}

function iascLoadActivasiPrefill() {
    try {
        var raw = sessionStorage.getItem("iasc_activasi_prefill");
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}
