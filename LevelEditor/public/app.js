$(function () {
    let blockCounter = 0;

    const $editor = $('#editor');
    const $levelId = $('#level-id');
    const $elementType = $('#element-type');

    function createBlock(blockData = {}) {
        const type = blockData.type || $elementType.val() || "block";

        const id = blockData.id || `elem-${type}-${++blockCounter}`;

        const x = (blockData.x !== undefined) ? blockData.x : 50;
        const y = (blockData.y !== undefined) ? blockData.y : 50;
        const width = (blockData.width !== undefined) ? blockData.width : 100;
        const height = (blockData.height !== undefined) ? blockData.height : 100;

        const block = $('<div></div>')
            .addClass('block')
            .addClass('elem-' + type)
            .attr('id', id)
            .data('type', type)
            .css({
                top: y,
                left: x,
                width: width,
                height: height,
            })
            .appendTo($editor);

        block.draggable({
            containment: "#editor"
        });

        block.on("contextmenu", function (e) {
            e.preventDefault();
            if (confirm("Delete this block")) {
                $(this).remove();
            }
        });

        return block;
    }

    function collectBlocks() {
        const blocks = [];
        $(".block").each(function () {
            const b = $(this);
            const pos = b.position();
            blocks.push({
                id: b.attr('id'),
                x: pos.left,
                y: pos.top,
                width: b.width(),
                height: b.height(),
                type: b.data('type') || "block"
            });
        });

        return blocks;
    };

    function renderLevel(blocks) {
        $editor.empty();
        blockCounter = 0;
        blocks.forEach(b => {
            createBlock(b);
        })
    }

    $('#add-block').click(function () {
        createBlock({});
    });

    $('#save-level').click(function () {
        const blocks = collectBlocks();

        if (blocks.length === 0) {
            alert('The level is empty. Add some blocks before saving.');
            return;
        }

        const id = $levelId.val().trim();
        const payload = { blocks };

        let method, url;
        if (id) {

            method = 'PUT';
            url = '/api/v1/levels/' + encodeURIComponent(id);
        } else {
            method = 'POST';
            url = '/api/v1/levels';
        }

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {

                alert(response.message + ' (ID = ' + response.id + ')');

                if (!id) {

                    $levelId.val(response.id);
                }

            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error saving level: ' + msg);
            }
        });
    });

    $('#load-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to load.');
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'GET',
            contentType: 'application/json',
            success: function (response) {
                renderLevel(response.blocks || []);
                alert('Level loaded successfully.');
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error loading level: ' + msg);
            }
        });
    });

    $('#delete-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to delete.');
            return;
        }

        if (!confirm(`Are you sure you want to delete level "${id}"?`)) {
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'DELETE',
            success: function () {
                alert('Level deleted.');

                $levelId.val('');
                $editor.empty();
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error deleting level: ' + msg);
            }
        });
    });

});

