const fs = require('fs');
const path = require('path');

class Node {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
}

function buildHuffmanTree(freqMap) {
    const nodes = [];
    for (const char in freqMap) {
        nodes.push(new Node(char, freqMap[char]));
    }

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();
        const newNode = new Node(null, left.freq + right.freq, left, right);
        nodes.push(newNode);
    }

    return nodes[0];
}

function buildHuffmanCodes(node, prefix = '', codeMap = {}) {
    if (!node.left && !node.right) {
        codeMap[node.char] = prefix;
    } else {
        if (node.left) buildHuffmanCodes(node.left, prefix + '0', codeMap);
        if (node.right) buildHuffmanCodes(node.right, prefix + '1', codeMap);
    }
    return codeMap;
}

function compress(input) {
    const freqMap = {};
    for (const char of input) {
        if (!freqMap[char]) {
            freqMap[char] = 0;
        }
        freqMap[char]++;
    }

    const huffmanTree = buildHuffmanTree(freqMap);
    const huffmanCodes = buildHuffmanCodes(huffmanTree);

    let compressedData = '';
    for (const char of input) {
        compressedData += huffmanCodes[char];
    }

    const buffer = Buffer.alloc(Math.ceil(compressedData.length / 8));
    for (let i = 0; i < compressedData.length; i += 8) {
        const byte = compressedData.slice(i, i + 8).padEnd(8, '0');
        buffer[Math.floor(i / 8)] = parseInt(byte, 2);
    }

    const metaData = JSON.stringify({ freqMap });

    const compressedFile = Buffer.concat([Buffer.from(metaData + '\n'), buffer]);

    return compressedFile;
}

function decompress(inputFilePath, outputFilePath) {
    const data = fs.readFileSync(inputFilePath);

    const [metaDataStr, compressedData] = data.toString('binary').split('\n', 1);
    const metaData = JSON.parse(metaDataStr);

    const { freqMap } = metaData;
    const huffmanTree = buildHuffmanTree(freqMap);
    const huffmanCodes = buildHuffmanCodes(huffmanTree);
    const reversedHuffmanCodes = Object.entries(huffmanCodes).reduce((acc, [char, code]) => {
        acc[code] = char;
        return acc;
    }, {});

    const binaryData = [];
    for (let i = metaDataStr.length + 1; i < data.length; i++) {
        const byte = data[i].toString(2).padStart(8, '0');
        binaryData.push(byte);
    }
    const binaryString = binaryData.join('');

    let currentCode = '';
    let decompressedData = '';

    for (const bit of binaryString) {
        currentCode += bit;
        if (reversedHuffmanCodes[currentCode]) {
            decompressedData += reversedHuffmanCodes[currentCode];
            currentCode = '';
        }
    }

    fs.writeFileSync(outputFilePath, decompressedData, 'utf8');
    console.log(`File decompressed and saved as ${outputFilePath}`);
}

module.exports = { compress, decompress };
