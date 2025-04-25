
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
                         <option value="Verse" ${line.section === 'Intro' ? 'selected' : ''}>Intro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Chords</label>
                    <input type="text" class="form-input" data-index="${index}" data-field="chords" placeholder="Chords (e.g., G D Em C)" value="${line.chords}">
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

    function handleSave() {
        savedSong = {
            title: titleInput.value,
            artist: artistInput.value,
            bpm: bpmInput.value,
            key: keyInput.value,
            timeSignature: timeSignatureInput.value,
            lines: lines,
        };
        renderSavedSong();
    }

    function renderAlignedChordsAndLyrics(chords, lyrics) {
        const chordParts = chords.split(" ");
        const words = lyrics.split(/(\s+)/);
        let chordIndex = 0;
        let chordLine = "";

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word.trim() === "") {
                chordLine += word; // just add whitespace if it's a whitespace
                continue;
            }
            const chord = chordParts[chordIndex] || "";
            chordLine += chord.padEnd(word.length, " "); // pad chord to word length
            chordIndex++;
        }

        return `<div><div>${chordLine}</div><div>${lyrics}</div></div>`;
      }

      function renderSavedSong() {
        if (savedSong) {
          let songHtml = `<div class="card p-4" style="font-family: 'Inter', sans-serif; color: black; background-color: white;">
            <h2 class="text-xl font-semibold mb-2">${savedSong.title} - ${savedSong.artist}</h2>
            <p class="text-sm text-muted-foreground mb-4">Key: ${savedSong.key} | Time Signature: ${savedSong.timeSignature} | BPM: ${savedSong.bpm}</p>
            <div class="space-y-4">`;
          savedSong.lines.forEach(line => {
            songHtml += `<div class="leading-tight" style="font-family: 'Inter', sans-serif;">
              ${line.section !== 'None' ? `<div class="text-xs uppercase font-bold text-gray-500">${line.section}</div>` : ''}
              ${renderAlignedChordsAndLyrics(line.chords, line.lyrics)}
            </div>`;
          });
          songHtml += `</div>
          </div>`;
          savedSongContainer.innerHTML = songHtml;
        } else {
          savedSongContainer.innerHTML = '';
        }
      }

      function downloadSong(format) {
        if (savedSong) {
          let songText = `${savedSong.title} - ${savedSong.artist}\n`;
          songText += `Key: ${savedSong.key} | Time Signature: ${savedSong.timeSignature} | BPM: ${savedSong.bpm}\n\n`;

          savedSong.lines.forEach(line => {
            if (line.section !== 'None') {
              songText += `${line.section}\n`;
            }
                  const alignedText = renderAlignedChordsAndLyrics(line.chords, line.lyrics);

                  // Extract the chord line and lyrics line
                  const chordLine = alignedText.match(/<div>(.*?)<\/div>/)[1] || '';
                  const lyricsLine = alignedText.match(/<div><div>.*?<\/div><div>(.*?)<\/div><\/div>/)[1] || '';

                  songText += `${chordLine}\n`;
                  songText += `${lyricsLine}\n`;
                  songText += `\n`;
              });

              let blob;
              let filename;

              blob = new Blob([songText], { type: 'text/plain' });
              filename = `${savedSong.title}.txt`;


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
            const tempElement = document.createElement('div');
            tempElement.style.position = 'absolute';
            tempElement.style.left = '-9999px';
            tempElement.innerHTML = savedSongContainer.innerHTML; // Copy the HTML from the preview
            document.body.appendChild(tempElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(tempElement);
            selection.addRange(range);
            document.execCommand('copy');
            document.body.removeChild(tempElement);
            alert('Formatted text copied to clipboard!');
        } else {
            alert('No song saved yet!');
        }
    }

    saveButton.addEventListener('click', handleSave);
    downloadTextButton.addEventListener('click', () => downloadSong('txt'));
    copyTextButton.addEventListener('click', copyText);
    renderLines();
