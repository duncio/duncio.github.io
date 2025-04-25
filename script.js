const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const bpmInput = document.getElementById('bpm');
const keyInput = document.getElementById('key');
const timeSignatureInput = document.getElementById('timeSignature');
const bulkInput = document.getElementById('bulkInput');
const bulkInputButton = document.getElementById('bulkInputButton');
const linesContainer = document.getElementById('linesContainer');
const addLineButton = document.getElementById('addLineButton');
const saveButton = document.getElementById('saveButton');
const savedSongContainer = document.getElementById('savedSongContainer');
const downloadTextButton = document.getElementById('downloadTextButton');
const copyTextButton = document.getElementById('copyTextButton');

let lines = [];
let savedSong = null;

bulkInputButton.addEventListener('click', () => {
    const parsedLines = bulkInput.value
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => ({ section: 'Verse', lyrics: line, chords: '' }));
    lines = parsedLines;
    renderLines();
    bulkInput.value = '';
});

addLineButton.addEventListener('click', () => {
    lines.push({ section: 'Verse', lyrics: '', chords: '' });
    renderLines();
});

function handleLineChange(index, field, value) {
    const newLines = [...lines];
    newLines[index][field] = value;
    lines = newLines;
}

function renderLines() {
    linesContainer.innerHTML = '';
    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'grid gap-2';
        lineDiv.innerHTML = `
            <div class="form-group">
                <label class="form-label">Section</label>
                <select class="form-select" data-index="${index}" data-field="section">
                    <option value="None">None</option>
                    <option value="Verse" ${line.section === 'Verse' ? 'selected' : ''}>Verse</option>
                    <option value="Chorus" ${line.section === 'Chorus' ? 'selected' : ''}>Chorus</option>
                    <option value="Bridge" ${line.section === 'Bridge' ? 'selected' : ''}>Bridge</option>
                    <option value="Intro" ${line.section === 'Intro' ? 'selected' : ''}>Intro</option>
                    <option value="Outro" ${line.section === 'Outro' ? 'selected' : ''}>Outro</option>
                    <option value="Interlude" ${line.section === 'Interlude' ? 'selected' : ''}>Interlude</option>
                    <option value="Pre-Chorus" ${line.section === 'Pre-Chorus' ? 'selected' : ''}>Pre-Chorus</option>        
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Chords <span class="text-sm">(use double space to skip words)</span></label>
                <div class="input-wrapper">
                    <input type="text" class="form-input space-visible" data-index="${index}" data-field="chords" placeholder="Chords (e.g., G D  Em C)" value="${line.chords}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Lyrics</label>
                <input type="text" class="form-input" data-index="${index}" data-field="lyrics" placeholder="Lyrics" value="${line.lyrics}">
            </div>
        `;
        const selectElement = lineDiv.querySelector('select');
        const chordsInput = lineDiv.querySelector('input[data-field="chords"]');
        const lyricsInput = lineDiv.querySelector('input[data-field="lyrics"]');

        selectElement.addEventListener('change', (event) => {
            handleLineChange(index, 'section', event.target.value);
        });
        
        chordsInput.addEventListener('input', (event) => {
            handleLineChange(index, 'chords', event.target.value);
        });
        
        lyricsInput.addEventListener('input', (event) => {
            handleLineChange(index, 'lyrics', event.target.value);
        });
        
        linesContainer.appendChild(lineDiv);
    });
}

function renderAlignedChordsAndLyrics(chords, lyrics) {
    // Handle empty inputs
    if (!lyrics.trim()) {
        return `<div class="font-mono whitespace-pre"><div>${chords}</div><div></div></div>`;
    }
    
    // Find positions of all words in lyrics
    const wordPositions = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(lyrics)) !== null) {
        wordPositions.push(match.index);
    }
    
    // Create a chord line with each chord positioned above its corresponding word
    let chordLine = Array(lyrics.length).fill(' ');
    
    // Split chords by any whitespace and preserve empty entries
    // This is the key change - we preserve empty positions by checking for consecutive spaces
    const rawChordInput = chords.trim();
    const chordParts = [];
    let currentChord = '';
    let skipNext = false;
    
    // Parse the chord input to handle spaces correctly
    for (let i = 0; i < rawChordInput.length; i++) {
        const char = rawChordInput[i];
        
        if (char === ' ') {
            // If we were building a chord, push it
            if (currentChord) {
                chordParts.push(currentChord);
                currentChord = '';
            }
            
            // Check if this is a double space (used to skip a word)
            if (i < rawChordInput.length - 1 && rawChordInput[i+1] === ' ') {
                chordParts.push(''); // Add an empty chord placeholder
                skipNext = true; // Skip the next space
            } else if (!skipNext) {
                // Regular space, just separates chords
            } else {
                // Reset skip flag
                skipNext = false;
            }
        } else {
            currentChord += char;
        }
    }
    
    // Don't forget the last chord if there is one
    if (currentChord) {
        chordParts.push(currentChord);
    }
    
    // Now place the chords at the appropriate word positions
    for (let i = 0; i < chordParts.length; i++) {
        if (i >= wordPositions.length) break; // No more words to align with
        
        const chord = chordParts[i];
        if (!chord) continue; // Skip empty chord positions
        
        const position = wordPositions[i];
        
        // Place the chord at this position
        for (let j = 0; j < chord.length; j++) {
            if (position + j < chordLine.length) {
                chordLine[position + j] = chord[j];
            }
        }
    }
    
    return `<div class="font-mono whitespace-pre"><div>${chordLine.join('')}</div><div>${lyrics}</div></div>`;
}

function handleSave() {
    savedSong = {
        title: titleInput.value || 'Untitled',
        artist: artistInput.value || '',
        bpm: bpmInput.value || '',
        key: keyInput.value || '',
        timeSignature: timeSignatureInput.value || '',
        lines: [...lines],  // Create a deep copy to prevent reference issues
    };
    renderSavedSong();
}

function renderSavedSong() {
    if (savedSong) {
        let songHtml = `<div class="card p-4" style="font-family: 'Inter', sans-serif; color: black; background-color: white;">
            <h2 class="text-xl font-semibold mb-2">${savedSong.title || 'Untitled'} ${savedSong.artist ? '- ' + savedSong.artist : ''}</h2>
            <p class="text-sm text-muted-foreground mb-4">
                ${savedSong.key ? 'Key: ' + savedSong.key : ''} 
                ${savedSong.timeSignature ? '| Time Signature: ' + savedSong.timeSignature : ''} 
                ${savedSong.bpm ? '| BPM: ' + savedSong.bpm : ''}
            </p>
            <div class="space-y-4">`;
            
        savedSong.lines.forEach(line => {
            songHtml += `<div class="leading-tight" style="font-family: 'Inter', sans-serif;">
                ${line.section !== 'None' ? `<div class="text-xs uppercase font-bold text-gray-500">${line.section}</div>` : ''}
                ${renderAlignedChordsAndLyrics(line.chords, line.lyrics)}
            </div>`;
        });
        
        songHtml += `</div></div>`;
        savedSongContainer.innerHTML = songHtml;
    } else {
        savedSongContainer.innerHTML = '';
    }
}

function getAlignedChordsAndLyrics(chords, lyrics) {
    // This is a utility function to generate aligned chord and lyric text
    // Used by both downloadSong and copyText for consistency
    
    if (!lyrics.trim()) {
        return { chordLine: chords, lyricsLine: '' };
    }
    
    // Find positions of all words in lyrics
    const wordPositions = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(lyrics)) !== null) {
        wordPositions.push(match.index);
    }
    
    // Create a chord line with each chord positioned above its corresponding word
    let chordLine = Array(lyrics.length).fill(' ');
    
    // Split chords by any whitespace and preserve empty entries
    const rawChordInput = chords.trim();
    const chordParts = [];
    let currentChord = '';
    let skipNext = false;
    
    // Parse the chord input to handle spaces correctly
    for (let i = 0; i < rawChordInput.length; i++) {
        const char = rawChordInput[i];
        
        if (char === ' ') {
            // If we were building a chord, push it
            if (currentChord) {
                chordParts.push(currentChord);
                currentChord = '';
            }
            
            // Check if this is a double space (used to skip a word)
            if (i < rawChordInput.length - 1 && rawChordInput[i+1] === ' ') {
                chordParts.push(''); // Add an empty chord placeholder
                skipNext = true; // Skip the next space
            } else if (!skipNext) {
                // Regular space, just separates chords
            } else {
                // Reset skip flag
                skipNext = false;
            }
        } else {
            currentChord += char;
        }
    }
    
    // Don't forget the last chord if there is one
    if (currentChord) {
        chordParts.push(currentChord);
    }
    
    // Now place the chords at the appropriate word positions
    for (let i = 0; i < chordParts.length; i++) {
        if (i >= wordPositions.length) break; // No more words to align with
        
        const chord = chordParts[i];
        if (!chord) continue; // Skip empty chord positions
        
        const position = wordPositions[i];
        
        // Place the chord at this position
        for (let j = 0; j < chord.length; j++) {
            if (position + j < chordLine.length) {
                chordLine[position + j] = chord[j];
            }
        }
    }
    
    return {
        chordLine: chordLine.join(''),
        lyricsLine: lyrics
    };
}

function downloadSong() {
    if (savedSong) {
        let songText = `${savedSong.title || 'Untitled'} ${savedSong.artist ? '- ' + savedSong.artist : ''}\n`;
        if (savedSong.key || savedSong.timeSignature || savedSong.bpm) {
            songText += `${savedSong.key ? 'Key: ' + savedSong.key : ''} ${savedSong.timeSignature ? '| Time Signature: ' + savedSong.timeSignature : ''} ${savedSong.bpm ? '| BPM: ' + savedSong.bpm : ''}\n`;
        }
        songText += '\n';

        savedSong.lines.forEach(line => {
            if (line.section !== 'None') {
                songText += `${line.section}\n`;
            }
            
            // Generate chord line and lyrics line
            if (line.chords.trim() || line.lyrics.trim()) {
                const { chordLine, lyricsLine } = getAlignedChordsAndLyrics(line.chords, line.lyrics);
                songText += `${chordLine}\n`;
                songText += `${lyricsLine}\n`;
            }
            
            songText += `\n`;
        });

        const blob = new Blob([songText], { type: 'text/plain' });
        const filename = `${savedSong.title || 'Song'}.txt`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert('No song saved yet!');
    }
}

function copyText() {
    if (savedSong) {
        let songText = `${savedSong.title || 'Untitled'} ${savedSong.artist ? '- ' + savedSong.artist : ''}\n`;
        if (savedSong.key || savedSong.timeSignature || savedSong.bpm) {
            songText += `${savedSong.key ? 'Key: ' + savedSong.key : ''} ${savedSong.timeSignature ? '| Time Signature: ' + savedSong.timeSignature : ''} ${savedSong.bpm ? '| BPM: ' + savedSong.bpm : ''}\n`;
        }
        songText += '\n';

        savedSong.lines.forEach(line => {
            if (line.section !== 'None') {
                songText += `${line.section}\n`;
            }
            
            // Generate chord line and lyrics line using the shared function
            if (line.chords.trim() || line.lyrics.trim()) {
                const { chordLine, lyricsLine } = getAlignedChordsAndLyrics(line.chords, line.lyrics);
                songText += `${chordLine}\n`;
                songText += `${lyricsLine}\n`;
            }
            
            songText += `\n`;
        });

        // Create temporary textarea to copy the text
        const tempElement = document.createElement('textarea');
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.value = songText;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        alert('Song text copied to clipboard!');
    } else {
        alert('No song saved yet!');
    }
}

// Add example and tips section
const helpElement = document.createElement('div');
helpElement.className = 'tip-box mb-4';
helpElement.innerHTML = `
    <div class="font-bold mb-1">Double Space Tips:</div>
    <div>Seperate chords with a space. Double spaces skip words in lyrics.</div>
    
`;

// Insert help element after the song metadata section
document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-4.mb-6').after(helpElement);

saveButton.addEventListener('click', handleSave);
downloadTextButton.addEventListener('click', downloadSong);
copyTextButton.addEventListener('click', copyText);
renderLines();