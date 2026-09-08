/* Minimore StoreHub Integration — Admin JS */
(function ($) {
    'use strict';

    $(document).ready(function () {

        var $btn        = $('#msi-test-btn');
        var $result     = $('#msi-test-result');
        var $storeSelect = $('#msi_store_id');

        $btn.on('click', function () {
            var subdomain = $('[name="msi_subdomain"]').val().trim();
            var apiToken  = $('[name="msi_api_token"]').val().trim();

            if (!subdomain || !apiToken) {
                $result.html('<span style="color:red;">&#10006; Please enter Subdomain and API Token first.</span>');
                return;
            }

            $btn.prop('disabled', true).text('Testing…');
            $result.html('');

            $.post(msiAdmin.ajax_url, {
                action:     'msi_test_connection',
                nonce:      msiAdmin.nonce,
                subdomain:  subdomain,
                api_token:  apiToken
            }, function (response) {
                if (response.success) {
                    $result.html('<span style="color:green;">&#10003; Connected!</span>');
                    populateStores(response.data);
                } else {
                    $result.html('<span style="color:red;">&#10006; ' + escHtml(response.data) + '</span>');
                }
            }).fail(function () {
                $result.html('<span style="color:red;">&#10006; Request failed. Check your network.</span>');
            }).always(function () {
                $btn.prop('disabled', false).text('Test Connection & Load Stores');
            });
        });

        function populateStores(stores) {
            var currentId   = msiAdmin.store_id;

            $storeSelect.empty();

            if (!stores || stores.length === 0) {
                $storeSelect.append('<option value="">— No stores found —</option>');
                return;
            }

            $storeSelect.append('<option value="">— Select the Online Store —</option>');

            $.each(stores, function (i, store) {
                var selected = (String(store.id) === String(currentId)) ? ' selected' : '';
                $storeSelect.append(
                    '<option value="' + escAttr(store.id) + '"' + selected + '>' + escHtml(store.name) + '</option>'
                );
            });

            // Persist the store name alongside ID when the selection changes
            $storeSelect.off('change.msi').on('change.msi', function () {
                var selectedOption = $storeSelect.find('option:selected');
                if (selectedOption.val()) {
                    persistStoreSelection(selectedOption.val(), selectedOption.text());
                }
            });
        }

        function persistStoreSelection(storeId, storeName) {
            $.post(msiAdmin.ajax_url, {
                action:     'msi_fetch_stores',
                nonce:      msiAdmin.nonce,
                store_id:   storeId,
                store_name: storeName
            });
        }

        function escHtml(str) {
            return $('<div>').text(str).html();
        }

        function escAttr(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    });

}(jQuery));
