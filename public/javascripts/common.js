/**
 * Created by beiwp on 2016/5/30.
 */

var jsUtil = {
    /**
     * alert 提示
     * @param message
     */
    alert:function(message){
        $('#myModal').find('.modal-body').html(message);
        $('#myModal').find('#myModalLabel').text('提示');
        $('#myModal').find('.btn-primary').hide();
        $('#myModal').modal('show');
    }
};